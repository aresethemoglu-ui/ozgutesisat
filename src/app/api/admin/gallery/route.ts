import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin-auth";
import { getGallery } from "@/lib/gallery";
import { readGallery, writeGallery, isCategory, safeKey, mediaExists, moveMedia, removeMedia } from "@/lib/store";

export const dynamic = "force-dynamic";
const err = (error: string, status = 400) => NextResponse.json({ error }, { status });
const str = (v: unknown, n = 300) => (typeof v === "string" ? v.trim().slice(0, n) : undefined);
const ytId = (u: string) => u.match(/(?:youtu\.be\/|v=|shorts\/|embed\/|live\/)([\w-]{11})/)?.[1] ?? (/^[\w-]{11}$/.test(u) ? u : null);
const done = () => { revalidatePath("/", "layout"); return NextResponse.json({ ok: true }); };

export async function GET() {
  if (!(await isAdmin())) return err("Oturum açmanız gerekiyor.", 401);
  return NextResponse.json({ items: await getGallery() });
}

// YouTube videosu ekle
export async function POST(req: Request) {
  if (!(await isAdmin())) return err("Oturum açmanız gerekiyor.", 401);
  const b = await req.json().catch(() => ({}));
  const id = ytId(String(b.url ?? "").trim()); if (!id) return err("Geçerli bir YouTube bağlantısı girin.");
  if (!isCategory(b.category)) return err("Kategori seçin.");
  const meta = await readGallery();
  if (meta.youtube.some((y) => y.id === id)) return err("Bu video zaten ekli.");
  meta.youtube.push({ id, title: str(b.title, 120) || "Video", category: b.category, date: str(b.date, 10), added: Date.now() });
  await writeGallery(meta);
  return done();
}

// Başlık / açıklama / konum / tarih / kategori güncelle
export async function PATCH(req: Request) {
  if (!(await isAdmin())) return err("Oturum açmanız gerekiyor.", 401);
  const b = await req.json().catch(() => ({}));
  const meta = await readGallery();
  const fields = { title: str(b.title, 120), text: str(b.text, 500), location: str(b.location, 80), date: str(b.date, 10) };

  if (typeof b.key === "string" && b.key.startsWith("yt:")) {
    const y = meta.youtube.find((x) => x.id === b.key.slice(3)); if (!y) return err("Video bulunamadı.", 404);
    Object.assign(y, { title: fields.title || y.title, date: fields.date }, isCategory(b.category) ? { category: b.category } : {});
    await writeGallery(meta); return done();
  }
  if (!safeKey(b.key) || !(await mediaExists(b.key, meta))) return err("Dosya bulunamadı.", 404);
  let key: string = b.key;
  if (isCategory(b.category) && b.category !== safeKey(key)!.category) key = await moveMedia(key, b.category, meta);
  meta.items[key] = { ...meta.items[key], ...fields };
  await writeGallery(meta);
  return done();
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return err("Oturum açmanız gerekiyor.", 401);
  const key = new URL(req.url).searchParams.get("key") ?? "";
  const meta = await readGallery();
  if (key.startsWith("yt:")) meta.youtube = meta.youtube.filter((y) => y.id !== key.slice(3));
  else { if (!safeKey(key)) return err("Geçersiz öğe."); await removeMedia(key, meta); }
  await writeGallery(meta);
  return done();
}
