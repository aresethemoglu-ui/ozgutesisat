import { readGallery, listFiles, mediaUrl, baseName, IMG, VID, type Category } from "@/lib/store";

export type { Category };
export type Media = {
  key: string; kind: "photo" | "video" | "youtube"; category: Category;
  src: string; poster?: string; title: string; text?: string; location?: string; date?: string; added?: number;
};
const pretty = (f: string) => {
  const s = baseName(f).replace(/-\d{10,}$/, "").replace(/[-_]+/g, " ").trim();
  return s.charAt(0).toLocaleUpperCase("tr") + s.slice(1);
};

// Yüklenen dosyalar + başlıklar + YouTube videoları, en yeniden eskiye
export async function getGallery(): Promise<Media[]> {
  const meta = await readGallery();
  const files = await listFiles(meta);
  const out: Media[] = [];
  for (const f of files) {
    const isVid = VID.test(f.file);
    const sameBase = (x: typeof f) => x.category === f.category && baseName(x.file) === baseName(f.file);
    if (!isVid && files.some((x) => VID.test(x.file) && sameBase(x))) continue; // video kapak resmi
    const poster = isVid ? files.find((x) => IMG.test(x.file) && sameBase(x)) : undefined;
    const c = meta.items[f.key] ?? {};
    out.push({
      key: f.key, kind: isVid ? "video" : "photo", category: f.category, src: mediaUrl(f.category, f.file),
      poster: poster && mediaUrl(poster.category, poster.file),
      title: c.title || pretty(f.file), text: c.text, location: c.location, date: c.date, added: c.added || f.added,
    });
  }
  for (const y of meta.youtube)
    out.push({ key: `yt:${y.id}`, kind: "youtube", category: y.category, src: y.id, title: y.title, date: y.date, added: y.added,
      poster: `https://i.ytimg.com/vi/${y.id}/hqdefault.jpg` });
  return out.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || (b.added ?? 0) - (a.added ?? 0));
}
