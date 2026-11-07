// Yerel içeriği (data/*.json + public/galeri/*) canlı sitenin Netlify Blobs deposuna aktarır.
// Kullanım:  NETLIFY_SITE_ID=... NETLIFY_AUTH_TOKEN=... node scripts/canliya-aktar.mjs
// (Netlify'a ilk yayından sonra bir kez çalıştırılır. Canlıdaki aynı adlı kayıtların üzerine yazar.)
import fs from "node:fs";
import path from "node:path";
import { getStore } from "@netlify/blobs";

const siteID = process.env.NETLIFY_SITE_ID, token = process.env.NETLIFY_AUTH_TOKEN;
if (!siteID || !token) { console.error("NETLIFY_SITE_ID ve NETLIFY_AUTH_TOKEN gerekli."); process.exit(1); }
const test = process.env.BLOBS_TEST_URL; // yalnızca yerel deneme için
const store = getStore({ name: "ozgu", siteID, token, ...(test && { edgeURL: test, uncachedEdgeURL: test }) });
const CHUNK = 3 * 1024 * 1024;
const MIME = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif", gif: "image/gif", mp4: "video/mp4", m4v: "video/mp4", webm: "video/webm", mov: "video/quicktime" };
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

const site = JSON.parse(fs.readFileSync(path.join(root, "data/site.json"), "utf8"));
const gal = JSON.parse(fs.readFileSync(path.join(root, "data/galeri.json"), "utf8"));
gal.files ??= {};
for (const cat of ["elektrik", "su"]) {
  const dir = path.join(root, "public/galeri", cat);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    const ext = f.split(".").pop().toLowerCase();
    if (f.startsWith(".") || !MIME[ext]) continue;
    const key = `${cat}/${f}`, buf = fs.readFileSync(path.join(dir, f));
    const chunks = Math.max(1, Math.ceil(buf.length / CHUNK));
    for (let i = 0; i < chunks; i++) await store.set(`m/${key}/${i}`, buf.subarray(i * CHUNK, (i + 1) * CHUNK));
    gal.files[key] = { size: buf.length, type: MIME[ext], chunks };
    console.log(`✓ ${key} (${(buf.length / 1048576).toFixed(1)} MB, ${chunks} parça)`);
  }
}
await store.setJSON("data/galeri.json", gal);
await store.setJSON("data/site.json", site);
console.log(`Tamam: ${Object.keys(gal.files).length} dosya, işletme bilgileri ve galeri verisi aktarıldı.`);
