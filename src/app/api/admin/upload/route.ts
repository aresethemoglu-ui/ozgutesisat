// Parçalı yükleme:
//   1) POST {action:"start", ...}            → sunucu dosya adını ve parça boyutunu verir
//   2) PUT  ?key=...&i=0,1,2… (ham bayt)      → her parça en fazla CHUNK bayt
//   3) POST {action:"finish", key, size, ...} → dosya tamamlanır, galeriye eklenir
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin-auth";
import { STORAGE, CHUNK, IMG, VID, baseName, isCategory, readGallery, safeKey, slug, writeChunk, writeGallery, finishUpload } from "@/lib/store";

export const dynamic = "force-dynamic";
const MAX_IMG = 25 * 1024 * 1024, MAX_VID = 500 * 1024 * 1024;
const err = (error: string, status = 400) => NextResponse.json({ error }, { status });
const str = (v: unknown, n = 300) => (typeof v === "string" ? v.trim().slice(0, n) : undefined);

export async function POST(req: Request) {
  if (!(await isAdmin())) return err("Oturum açmanız gerekiyor.", 401);
  const b = await req.json().catch(() => ({}));

  if (b.action === "start") {
    if (!isCategory(b.category)) return err("Kategori seçin.");
    const name = String(b.name ?? ""), type = String(b.type ?? ""), size = Number(b.size);
    const ext = (name.match(/\.[a-z0-9]+$/i)?.[0] ?? "").toLowerCase();
    const isImg = IMG.test(ext) && type.startsWith("image/"), isVid = VID.test(ext) && type.startsWith("video/");
    if (!isImg && !isVid) return err(`Desteklenmeyen dosya türü: ${name}`);
    if (!(size > 0) || size > (isImg ? MAX_IMG : MAX_VID)) return err(`Dosya çok büyük: ${name} (sınır ${isImg ? 25 : 500} MB)`);
    // Canlıda fotoğraflar tek parça olmalı (tarayıcı yüklemeden önce küçültür)
    if (isImg && STORAGE === "netlify" && size > CHUNK) return err(`Fotoğraf çok büyük (${(size / 1048576).toFixed(1)} MB). Tarayıcı küçültemedi; JPG olarak tekrar deneyin.`);
    let file: string;
    if (b.posterFor) { // video kapak resmi: videoyla aynı ad
      const v = safeKey(b.posterFor); if (!v || !VID.test(v.file) || !isImg) return err("Geçersiz kapak.");
      file = `${baseName(v.file)}${ext}`;
    } else file = `${slug(str(b.title) || baseName(name))}-${Date.now()}${ext}`;
    return NextResponse.json({ key: `${b.category}/${file}`, chunk: CHUNK });
  }

  if (b.action === "finish") {
    const k = safeKey(b.key); if (!k) return err("Geçersiz dosya.");
    const meta = await readGallery();
    try { await finishUpload(b.key, Number(b.size), String(b.type ?? ""), meta); }
    catch (e) { return err((e as Error).message || "Yükleme tamamlanamadı."); }
    if (!b.poster) meta.items[b.key] = {
      title: str(b.title, 120) || baseName(String(b.name ?? k.file)).replace(/[-_]+/g, " "),
      text: str(b.text, 500), location: str(b.location, 80), date: str(b.date, 10), added: Date.now(),
    };
    await writeGallery(meta);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, key: b.key });
  }
  return err("Geçersiz istek.");
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return err("Oturum açmanız gerekiyor.", 401);
  const u = new URL(req.url), key = u.searchParams.get("key"), i = Number(u.searchParams.get("i"));
  if (!safeKey(key) || !Number.isInteger(i) || i < 0 || i > 1000) return err("Geçersiz parça.");
  const data = new Uint8Array(await req.arrayBuffer());
  if (!data.length || data.length > CHUNK) return err("Parça boyutu geçersiz.");
  await writeChunk(key!, i, data);
  return NextResponse.json({ ok: true });
}
