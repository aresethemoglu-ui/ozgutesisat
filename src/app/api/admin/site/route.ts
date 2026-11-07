import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin-auth";
import { readJSON, writeJSON } from "@/lib/store";
import { mergeSite, type SiteInfo } from "@/config/site";

export const dynamic = "force-dynamic";
const TEXT = ["name", "shortName", "master", "slogan", "experienceYears", "phone", "whatsapp", "email", "city", "district", "address", "hours", "emergency", "url"] as const;
const clean = (v: unknown, n = 200) => (typeof v === "string" ? v.trim().slice(0, n) : "");
const err = (error: string, status = 400) => NextResponse.json({ error }, { status });
const current = async () => mergeSite(await readJSON<Partial<SiteInfo> | null>("site.json", null));

export async function GET() {
  if (!(await isAdmin())) return err("Oturum açmanız gerekiyor.", 401);
  return NextResponse.json({ site: await current() });
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return err("Oturum açmanız gerekiyor.", 401);
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") return err("Geçersiz veri.");
  const next: SiteInfo = structuredClone(await current());
  for (const k of TEXT) if (k in b) next[k] = clean(b[k]);
  if ("about" in b) next.about = clean(b.about, 1500);
  if (next.phone && !/^\+90\d{10}$/.test(next.phone)) return err("Telefon +905xxxxxxxxx biçiminde olmalı.");
  if (next.whatsapp && !/^90\d{10}$/.test(next.whatsapp)) return err("WhatsApp 905xxxxxxxxx biçiminde olmalı (+ olmadan).");
  if (!/^https:\/\/[^\s/]+$/.test(next.url)) return err("Site adresi https://alanadi.com biçiminde olmalı (sonunda / olmadan).");
  if ("serviceAreas" in b) next.serviceAreas = String(b.serviceAreas ?? "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 40);
  for (const grp of ["social", "google"] as const)
    if (b[grp] && typeof b[grp] === "object") for (const k of Object.keys(next[grp]) as (keyof SiteInfo[typeof grp])[])
      if (k in b[grp]) (next[grp] as Record<string, string>)[k as string] = clean(b[grp][k], 1000);
  // Search Console: tüm meta etiketi yapıştırılırsa yalnızca content değerini al
  next.google.searchConsole = next.google.searchConsole.match(/content="([^"]+)"/)?.[1] ?? next.google.searchConsole;
  // Harita: tüm <iframe> kodu yapıştırılırsa yalnızca src adresini al
  next.google.mapsEmbedUrl = next.google.mapsEmbedUrl.match(/src="([^"]+)"/)?.[1] ?? next.google.mapsEmbedUrl;
  if (next.google.mapsEmbedUrl && !next.google.mapsEmbedUrl.startsWith("https://www.google.com/maps/embed")) return err("Harita adresi https://www.google.com/maps/embed… ile başlamalı.");
  if (next.google.analyticsId && !/^G-[A-Z0-9]{4,}$/.test(next.google.analyticsId)) return err("Analytics kimliği G-XXXXXXXXXX biçiminde olmalı.");
  await writeJSON("site.json", next);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
