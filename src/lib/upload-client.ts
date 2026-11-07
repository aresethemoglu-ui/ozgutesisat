// Tarayıcı tarafı yükleme yardımcıları (admin paneli)

// Fotoğrafı en fazla 1920 px'e küçültüp JPEG yapar (telefon fotoğrafları ~5-10 MB → ~0,5-1 MB).
export async function compressImage(f: File, max = 1920): Promise<File> {
  if (f.type === "image/gif") return f;
  try {
    const bmp = await createImageBitmap(f);
    const r = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * r); c.height = Math.round(bmp.height * r);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height); bmp.close();
    const blob = await new Promise<Blob | null>((res) => c.toBlob(res, "image/jpeg", 0.85));
    if (!blob || (r === 1 && f.type === "image/jpeg" && blob.size >= f.size)) return f;
    return new File([blob], f.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch { return f; }
}

// Videonun 1. saniyesinden kapak resmi üretir (olmazsa null).
export async function videoPoster(f: File): Promise<File | null> {
  const url = URL.createObjectURL(f);
  const v = document.createElement("video");
  v.muted = true; v.playsInline = true; v.preload = "auto"; v.src = url;
  const wait = (ev: "loadeddata" | "seeked") => new Promise<void>((res, rej) => {
    const t = setTimeout(() => rej(new Error("zaman aşımı")), 10000);
    v.addEventListener(ev, () => { clearTimeout(t); res(); }, { once: true });
    v.addEventListener("error", () => { clearTimeout(t); rej(new Error("video okunamadı")); }, { once: true });
  });
  try {
    await wait("loadeddata");
    v.currentTime = Math.min(1, (v.duration || 2) / 2); await wait("seeked");
    const r = Math.min(1, 1280 / Math.max(v.videoWidth, v.videoHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(v.videoWidth * r); c.height = Math.round(v.videoHeight * r);
    if (!c.width || !c.height) return null;
    c.getContext("2d")!.drawImage(v, 0, 0, c.width, c.height);
    const blob = await new Promise<Blob | null>((res) => c.toBlob(res, "image/jpeg", 0.8));
    return blob ? new File([blob], "kapak.jpg", { type: "image/jpeg" }) : null;
  } catch { return null; } finally { URL.revokeObjectURL(url); v.removeAttribute("src"); }
}

async function json(r: Response) {
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || `Hata ${r.status}`);
  return d;
}

export type Fields = { category: string; title?: string; text?: string; location?: string; date?: string };

// Parçalı yükleme. onProgress 0-1 arası değer alır.
export async function uploadFile(file: File, fields: Fields, onProgress: (p: number) => void, posterFor?: string): Promise<string> {
  const post = (body: object) => fetch("/api/admin/upload", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).then(json);
  const { key, chunk } = await post({ action: "start", name: file.name, type: file.type, size: file.size, posterFor, ...fields });
  const n = Math.max(1, Math.ceil(file.size / chunk));
  for (let i = 0; i < n; i++) {
    const part = file.slice(i * chunk, Math.min(file.size, (i + 1) * chunk));
    for (let attempt = 1; ; attempt++) {
      try {
        await fetch(`/api/admin/upload?key=${encodeURIComponent(key)}&i=${i}`, { method: "PUT", headers: { "content-type": "application/octet-stream" }, body: part }).then(json);
        break;
      } catch (e) { if (attempt >= 3) throw e; await new Promise((r) => setTimeout(r, 1000 * attempt)); }
    }
    onProgress((i + 1) / n);
  }
  await post({ action: "finish", key, size: file.size, type: file.type, name: file.name, poster: !!posterFor, ...fields });
  return key;
}
