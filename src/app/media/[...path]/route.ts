// Galeri dosyalarını Netlify Blobs'tan sunar (video için bayt aralığı / Range desteğiyle).
import { readRange } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path.map(decodeURIComponent);
  if (parts.length !== 2) return new Response("Bulunamadı", { status: 404 });
  const key = parts.join("/");
  const range = req.headers.get("range")?.match(/^bytes=(\d*)-(\d*)$/);
  let start = 0, end: number | null = null;
  if (range) {
    if (range[1] === "" && range[2]) { // son N bayt
      const head = await readRange(key, 0, 0); if (!head) return new Response("Bulunamadı", { status: 404 });
      start = Math.max(0, head.total - Number(range[2]));
    } else { start = Number(range[1] || 0); end = range[2] ? Number(range[2]) : null; }
  }
  const r = await readRange(key, start, end);
  if (!r) return new Response("Bulunamadı", { status: 404 });
  const headers: Record<string, string> = {
    "content-type": r.type, "accept-ranges": "bytes",
    "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff",
  };
  if (!r.data) return new Response(null, { status: 416, headers: { ...headers, "content-range": `bytes */${r.total}` } });
  const last = r.start + r.data.length - 1;
  const partial = range || last < r.total - 1;
  return new Response(r.data as BodyInit, {
    status: partial ? 206 : 200,
    headers: { ...headers, "content-length": String(r.data.length), ...(partial && { "content-range": `bytes ${r.start}-${last}/${r.total}` }) },
  });
}
