// Depolama katmanı — iki arka uç:
//   • "fs"      : yerel bilgisayar (npm run dev). Veriler data/*.json, medya public/galeri/* içinde.
//   • "netlify" : canlı site. Veriler ve medya Netlify Blobs'ta ("ozgu" deposu).
// Hangisinin kullanılacağı derleme anında belirlenir (next.config.js → env.STORAGE).
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { getStore } from "@netlify/blobs";

export const STORAGE = process.env.STORAGE === "netlify" ? "netlify" : "fs";
export const CHUNK = 3 * 1024 * 1024; // Netlify fonksiyon gövde sınırı (~6 MB) altında kalmak için 3 MB parçalar
export const CATEGORIES = ["elektrik", "su"] as const;
export type Category = (typeof CATEGORIES)[number];
export const isCategory = (c: unknown): c is Category => CATEGORIES.includes(c as Category);

export type ItemMeta = { title?: string; text?: string; location?: string; date?: string; added?: number };
export type YouTube = { id: string; title: string; category: Category; date?: string; added?: number };
export type FileRec = { size: number; type: string; chunks: number };
export type GalleryData = { items: Record<string, ItemMeta>; youtube: YouTube[]; files?: Record<string, FileRec> };
export type MediaFile = { category: Category; file: string; key: string; added: number };

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data");
const GALLERY_DIR = path.join(ROOT, "public", "galeri");
// Next.js global fetch'i önbellek için sarmalar ve yanıt gövdesini ikiye böler (tee). Blobs istemcisi 404'te
// gövdeyi cancel() ile kapatınca bu sarmalayıcıda istek sonsuza kadar askıda kalıyor → Next'in sakladığı özgün fetch'i kullan.
const rawFetch: typeof fetch = (input, init) =>
  ((fetch as typeof fetch & { _nextOriginalFetch?: typeof fetch })._nextOriginalFetch ?? fetch)(input, init);
const blobs = () => getStore({ name: "ozgu", consistency: "strong", fetch: rawFetch });
// Blobs'ta olmayan bir anahtar okunduğunda (404) istek Next sunucusu içinde askıda kalabiliyor.
// Bu yüzden okumadan önce list() ile varlığını kontrol ediyoruz; list her zaman güvenli.
async function blobExists(key: string) {
  const { blobs: found } = await blobs().list({ prefix: key });
  return found.some((b) => b.key === key);
}
const chunkKey = (key: string, i: number) => `m/${key}/${i}`;

export const IMG = /\.(jpe?g|png|webp|avif|gif)$/i;
export const VID = /\.(mp4|webm|mov|m4v)$/i;
export const baseName = (f: string) => f.replace(/\.[^.]+$/, "");
export const mimeOf = (f: string) =>
  ({ jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif", gif: "image/gif",
     mp4: "video/mp4", m4v: "video/mp4", webm: "video/webm", mov: "video/quicktime" } as Record<string, string>)[f.split(".").pop()!.toLowerCase()] ?? "application/octet-stream";

/* ---------- JSON ---------- */
export async function readJSON<T>(name: string, def: T): Promise<T> {
  try {
    if (STORAGE === "netlify") {
      if (!(await blobExists(`data/${name}`))) return def;
      return ((await blobs().get(`data/${name}`, { type: "json" })) as T) ?? def;
    }
    return JSON.parse(await fsp.readFile(path.join(DATA, name), "utf8"));
  } catch { return def; }
}
export async function writeJSON(name: string, v: unknown) {
  if (STORAGE === "netlify") { await blobs().setJSON(`data/${name}`, v); return; }
  await fsp.mkdir(DATA, { recursive: true });
  const p = path.join(DATA, name), tmp = `${p}.tmp`;
  await fsp.writeFile(tmp, JSON.stringify(v, null, 2) + "\n"); await fsp.rename(tmp, p);
}
export const readGallery = () => readJSON<GalleryData>("galeri.json", { items: {}, youtube: [], files: {} });
export const writeGallery = (g: GalleryData) => writeJSON("galeri.json", g);

/* ---------- Medya ---------- */
export const mediaUrl = (category: Category, file: string) =>
  STORAGE === "netlify" ? `/media/${category}/${encodeURIComponent(file)}` : `/galeri/${category}/${encodeURIComponent(file)}`;

export async function listFiles(meta: GalleryData): Promise<MediaFile[]> {
  if (STORAGE === "netlify")
    return Object.keys(meta.files ?? {}).flatMap((key) => {
      const k = safeKey(key); return k ? [{ ...k, key, added: meta.items[key]?.added ?? 0 }] : [];
    });
  const out: MediaFile[] = [];
  for (const category of CATEGORIES) {
    let names: string[] = [];
    try { names = await fsp.readdir(path.join(GALLERY_DIR, category)); } catch { continue; }
    for (const file of names) {
      if (file.startsWith(".") || !(IMG.test(file) || VID.test(file))) continue;
      const key = `${category}/${file}`;
      let added = meta.items[key]?.added ?? 0;
      if (!added) try { added = (await fsp.stat(path.join(GALLERY_DIR, category, file))).mtimeMs; } catch {}
      out.push({ category, file, key, added });
    }
  }
  return out;
}

// Parçalı yükleme: parçalar sırayla gönderilir, sonunda finishUpload çağrılır.
export async function writeChunk(key: string, i: number, data: Uint8Array) {
  const k = safeKey(key)!;
  if (STORAGE === "netlify") { await blobs().set(chunkKey(key, i), data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer); return; }
  const dir = path.join(GALLERY_DIR, k.category); await fsp.mkdir(dir, { recursive: true });
  const part = path.join(dir, `.${k.file}.part`);
  if (i === 0) await fsp.rm(part, { force: true });
  await fsp.appendFile(part, data);
}
export async function finishUpload(key: string, size: number, type: string, meta: GalleryData) {
  const k = safeKey(key)!;
  const chunks = Math.max(1, Math.ceil(size / CHUNK));
  if (STORAGE === "netlify") {
    const { blobs: found } = await blobs().list({ prefix: `m/${key}/` });
    if (found.length !== chunks) throw new Error(`Eksik parça: ${found.length}/${chunks}`);
    (meta.files ??= {})[key] = { size, type, chunks };
    return;
  }
  const dir = path.join(GALLERY_DIR, k.category), part = path.join(dir, `.${k.file}.part`);
  const st = await fsp.stat(part).catch(() => null);
  if (!st || st.size !== size) { await fsp.rm(part, { force: true }); throw new Error("Dosya eksik yüklendi, tekrar deneyin."); }
  await fsp.rename(part, path.join(dir, k.file));
}

async function deleteOne(key: string, meta: GalleryData) {
  const k = safeKey(key); if (!k) return;
  if (STORAGE === "netlify") {
    const s = blobs();
    const { blobs: found } = await s.list({ prefix: `m/${key}/` });
    await Promise.all(found.map((b) => s.delete(b.key))); // yalnızca var olanları sil
    delete meta.files?.[key];
  } else await fsp.rm(path.join(GALLERY_DIR, k.category, k.file), { force: true });
  delete meta.items[key];
}
async function moveOne(from: string, to: string, meta: GalleryData) {
  const a = safeKey(from)!, b = safeKey(to)!;
  if (STORAGE === "netlify") {
    const s = blobs(), rec = meta.files?.[from]; if (!rec) return;
    for (let i = 0; i < rec.chunks; i++) {
      if (!(await blobExists(chunkKey(from, i)))) continue;
      const d = await s.get(chunkKey(from, i), { type: "arrayBuffer" }); if (d) await s.set(chunkKey(to, i), d);
    }
    meta.files![to] = rec; await deleteOne(from, { ...meta, items: {} }); delete meta.files![from];
  } else {
    await fsp.mkdir(path.join(GALLERY_DIR, b.category), { recursive: true });
    await fsp.rename(path.join(GALLERY_DIR, a.category, a.file), path.join(GALLERY_DIR, b.category, b.file));
  }
  if (meta.items[from]) { meta.items[to] = meta.items[from]; delete meta.items[from]; }
}

// Bir videoya ait kapak resimlerini (aynı adlı resim) bul
async function companions(key: string, meta: GalleryData) {
  const k = safeKey(key); if (!k || !VID.test(k.file)) return [];
  return (await listFiles(meta)).filter((f) => f.category === k.category && IMG.test(f.file) && baseName(f.file) === baseName(k.file)).map((f) => f.key);
}
export async function removeMedia(key: string, meta: GalleryData) {
  for (const c of await companions(key, meta)) await deleteOne(c, meta);
  await deleteOne(key, meta);
}
export async function moveMedia(key: string, category: Category, meta: GalleryData) {
  const k = safeKey(key)!;
  for (const c of await companions(key, meta)) await moveOne(c, `${category}/${safeKey(c)!.file}`, meta);
  const to = `${category}/${k.file}`; await moveOne(key, to, meta); return to;
}
export async function mediaExists(key: string, meta: GalleryData) {
  const k = safeKey(key); if (!k) return false;
  if (STORAGE === "netlify") return !!meta.files?.[key];
  return fs.existsSync(path.join(GALLERY_DIR, k.category, k.file));
}

// Bayt aralığı okuma (/media yolu için). En fazla bir parça döner → yanıt boyutu sınırın altında kalır.
export async function readRange(key: string, start: number, end: number | null) {
  const k = safeKey(key); if (!k) return null;
  if (STORAGE === "netlify") {
    const meta = await readGallery(); const rec = meta.files?.[key]; if (!rec) return null;
    if (start >= rec.size) return { total: rec.size, type: rec.type, start, data: null };
    const i = Math.floor(start / CHUNK), off = start - i * CHUNK;
    if (i >= rec.chunks || !(await blobExists(chunkKey(key, i)))) return null;
    const buf = await blobs().get(chunkKey(key, i), { type: "arrayBuffer" }); if (!buf) return null;
    const stop = Math.min(buf.byteLength, end === null ? buf.byteLength : end - i * CHUNK + 1);
    return { total: rec.size, type: rec.type, start, data: new Uint8Array(buf.slice(off, stop)) };
  }
  const p = path.join(GALLERY_DIR, k.category, k.file);
  const st = await fsp.stat(p).catch(() => null); if (!st) return null;
  if (start >= st.size) return { total: st.size, type: mimeOf(k.file), start, data: null };
  const stop = Math.min(st.size - 1, end ?? st.size - 1, start + CHUNK - 1);
  const fh = await fsp.open(p, "r");
  try { const data = new Uint8Array(stop - start + 1); await fh.read(data, 0, data.length, start); return { total: st.size, type: mimeOf(k.file), start, data }; }
  finally { await fh.close(); }
}

/* ---------- Güvenlik yardımcıları ---------- */
const TR: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u" };
export const slug = (s: string) =>
  s.replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => TR[c]).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "is";

// Yalnızca "kategori/dosya.uzantı" biçimindeki anahtarları kabul et (../ vb. engellenir).
export function safeKey(key: unknown): { category: Category; file: string } | null {
  if (typeof key !== "string") return null;
  const [category, file, ...rest] = key.split("/");
  if (rest.length || !isCategory(category) || !file || file !== path.basename(file) || file.startsWith(".") || /[\\\0]/.test(file) || file.includes("..")) return null;
  if (!(IMG.test(file) || VID.test(file))) return null;
  return { category, file };
}
