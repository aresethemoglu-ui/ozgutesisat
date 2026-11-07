"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Trash2, Save, LogOut, Images, Building2, Youtube, Play, ExternalLink, Check, AlertTriangle } from "lucide-react";
import type { Media } from "@/lib/gallery";
import { compressImage, videoPoster, uploadFile } from "@/lib/upload-client";

type Cat = "elektrik" | "su";
const input = "w-full rounded-md border border-slate-300 bg-white p-2.5 text-sm";
const today = () => new Date().toISOString().slice(0, 7);

export default function AdminPanel() {
  const [tab, setTab] = useState<"galeri" | "bilgi">("galeri");
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const flash = useCallback((ok: boolean, msg: string) => { setToast({ ok, msg }); setTimeout(() => setToast(null), 3500); }, []);
  const logout = async () => { await fetch("/api/admin/login", { method: "DELETE" }); location.reload(); };

  return (<div className="mx-auto max-w-6xl px-4 py-8">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-display text-4xl font-bold">Yönetim Paneli</h1>
      <div className="flex gap-2"><a href="/" target="_blank" className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-2 text-sm font-bold ring-1 ring-slate-300"><ExternalLink size={16} />Siteyi aç</a>
        <button onClick={logout} className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-2 text-sm font-bold ring-1 ring-slate-300"><LogOut size={16} />Çıkış</button></div>
    </div>
    <div className="mt-6 flex gap-2 border-b border-slate-300">
      {([["galeri", Images, "Fotoğraf & Video"], ["bilgi", Building2, "İşletme Bilgileri"]] as const).map(([k, I, t]) =>
        <button key={k} onClick={() => setTab(k)} className={`-mb-px inline-flex items-center gap-2 border-b-4 px-4 py-3 font-bold ${tab === k ? "border-accent text-navy" : "border-transparent text-slate-500"}`}><I size={18} />{t}</button>)}
    </div>
    {tab === "galeri" ? <GalleryAdmin flash={flash} /> : <InfoAdmin flash={flash} />}
    {toast && <div role="status" className={`fixed bottom-6 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-lg px-5 py-3 font-semibold text-white shadow-xl ${toast.ok ? "bg-green-700" : "bg-red-600"}`}>{toast.ok ? <Check size={18} /> : <AlertTriangle size={18} />}{toast.msg}</div>}
  </div>);
}

/* ---------------- GALERİ ---------------- */
function GalleryAdmin({ flash }: { flash: (ok: boolean, m: string) => void }) {
  const [items, setItems] = useState<Media[]>([]), [writable, setWritable] = useState(true), [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Cat>("all");
  const load = useCallback(async () => {
    const r = await fetch("/api/admin/gallery", { cache: "no-store" });
    if (r.status === 401) return location.reload();
    const d = await r.json(); setItems(d.items ?? []); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  const shown = items.filter((m) => filter === "all" || m.category === filter);

  return (<div className="mt-6 grid gap-6">
    
    <Uploader onDone={load} flash={flash} disabled={!writable} />
    <YouTubeAdd onDone={load} flash={flash} disabled={!writable} />
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-2xl font-bold">Yüklenenler ({items.length})</h2>
        <div className="flex gap-2">{([["all", "Tümü"], ["elektrik", "Elektrik"], ["su", "Su"]] as const).map(([k, t]) =>
          <button key={k} onClick={() => setFilter(k)} className={`rounded-full px-3 py-1.5 text-sm font-bold ${filter === k ? "bg-navy text-white" : "bg-white ring-1 ring-slate-300"}`}>{t}</button>)}</div></div>
      {loading ? <p className="mt-4 text-slate-500">Yükleniyor…</p>
        : !shown.length ? <p className="mt-4 rounded-lg border-2 border-dashed border-slate-300 p-8 text-center text-slate-500">Henüz içerik yok. Yukarıdan fotoğraf veya video yükleyin.</p>
        : <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{shown.map((m) => <ItemCard key={m.key} m={m} onChange={load} flash={flash} disabled={!writable} />)}</div>}
    </section>
  </div>);
}

type Job = { name: string; pct: number; status: "bekliyor" | "yükleniyor" | "tamam" | "hata"; err?: string };
function Uploader({ onDone, flash, disabled }: { onDone: () => void; flash: (ok: boolean, m: string) => void; disabled: boolean }) {
  const [cat, setCat] = useState<Cat>("elektrik"), [title, setTitle] = useState(""), [loc, setLoc] = useState(""), [date, setDate] = useState(today()), [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]), [jobs, setJobs] = useState<Job[]>([]), [busy, setBusy] = useState(false), [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const set = (i: number, p: Partial<Job>) => setJobs((j) => j.map((o, k) => (k === i ? { ...o, ...p } : o)));
  async function send(orig: File, i: number): Promise<boolean> {
    try {
      const isVid = orig.type.startsWith("video/");
      set(i, { status: "yükleniyor", pct: 0 });
      const f = isVid ? orig : await compressImage(orig);
      const fields = { category: cat, location: loc, date, text, title: files.length > 1 && title ? `${title} ${i + 1}` : title };
      const key = await uploadFile(f, fields, (p) => set(i, { pct: Math.round(p * (isVid ? 95 : 100)) }));
      if (isVid) { const poster = await videoPoster(orig); if (poster) await uploadFile(poster, { category: cat }, () => {}, key).catch(() => {}); }
      set(i, { status: "tamam", pct: 100 }); return true;
    } catch (e) { set(i, { status: "hata", err: (e as Error).message }); return false; }
  }
  async function start() {
    if (!files.length) return;
    setBusy(true); setJobs(files.map((f) => ({ name: f.name, pct: 0, status: "bekliyor" })));
    let bad = 0;
    for (let i = 0; i < files.length; i++) if (!(await send(files[i], i))) bad++;
    setBusy(false); onDone();
    flash(!bad, bad ? `${bad} dosya yüklenemedi` : `${files.length} dosya yüklendi`);
    setFiles([]); setTitle(""); setText(""); if (ref.current) ref.current.value = "";
  }
  const pick = (l: FileList | null) => l && setFiles(Array.from(l).filter((f) => /^(image|video)\//.test(f.type)));

  return (<section className="rounded-xl bg-white p-5 shadow-sm">
    <h2 className="flex items-center gap-2 font-display text-2xl font-bold"><Upload size={22} />Fotoğraf / Video Yükle</h2>
    <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files); }}
      onClick={() => ref.current?.click()} className={`mt-4 cursor-pointer rounded-lg border-2 border-dashed p-8 text-center ${drag ? "border-accent bg-accent/5" : "border-slate-300"}`}>
      <Upload className="mx-auto text-slate-400" size={32} />
      <p className="mt-2 font-bold">{files.length ? `${files.length} dosya seçildi` : "Dosyaları buraya sürükleyin veya tıklayıp seçin"}</p>
      <p className="text-sm text-slate-500">Fotoğraflar otomatik küçültülür · Video: MP4, MOV, WEBM (en fazla 500 MB; uzun videolar için YouTube önerilir)</p>
      {files.length > 0 && <p className="mt-2 truncate text-sm text-slate-600">{files.map((f) => f.name).join(", ")}</p>}
      <input ref={ref} type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => pick(e.target.files)} />
    </div>
    <div className="mt-4 grid gap-3 md:grid-cols-4">
      <label className="grid gap-1 text-sm font-semibold">Kategori<select className={input} value={cat} onChange={(e) => setCat(e.target.value as Cat)}><option value="elektrik">Elektrik</option><option value="su">Su tesisatı</option></select></label>
      <label className="grid gap-1 text-sm font-semibold md:col-span-2">Başlık<input className={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="örn: Daire pano yenileme" /></label>
      <label className="grid gap-1 text-sm font-semibold">Tarih<input type="month" className={input} value={date} onChange={(e) => setDate(e.target.value)} /></label>
      <label className="grid gap-1 text-sm font-semibold">Konum<input className={input} value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="örn: Haliliye" /></label>
      <label className="grid gap-1 text-sm font-semibold md:col-span-3">Kısa açıklama<input className={input} value={text} onChange={(e) => setText(e.target.value)} placeholder="örn: Eski galvaniz borular PPR ile değiştirildi" /></label>
    </div>
    <button disabled={disabled || busy || !files.length} onClick={start} className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 font-bold text-white disabled:opacity-50"><Upload size={18} />{busy ? "Yükleniyor…" : "Yükle"}</button>
    {jobs.length > 0 && <ul className="mt-4 grid gap-2">{jobs.map((j) => <li key={j.name} className="text-sm">
      <div className="flex justify-between"><span className="truncate">{j.name}</span><span className={j.status === "hata" ? "text-red-600" : "text-slate-500"}>{j.status === "hata" ? j.err : j.status === "tamam" ? "✓ tamam" : `${j.pct}%`}</span></div>
      <div className="mt-1 h-1.5 overflow-hidden rounded bg-slate-200"><div className={`h-full ${j.status === "hata" ? "bg-red-500" : "bg-accent"}`} style={{ width: `${j.pct}%` }} /></div></li>)}</ul>}
  </section>);
}

function YouTubeAdd({ onDone, flash, disabled }: { onDone: () => void; flash: (ok: boolean, m: string) => void; disabled: boolean }) {
  const [url, setUrl] = useState(""), [title, setTitle] = useState(""), [cat, setCat] = useState<Cat>("elektrik");
  async function add() {
    const r = await fetch("/api/admin/gallery", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url, title, category: cat, date: today() }) });
    const d = await r.json().catch(() => ({}));
    if (r.ok) { flash(true, "Video eklendi"); setUrl(""); setTitle(""); onDone(); } else flash(false, d.error || "Eklenemedi");
  }
  return (<section className="rounded-xl bg-white p-5 shadow-sm">
    <h2 className="flex items-center gap-2 font-display text-2xl font-bold"><Youtube size={22} />YouTube Videosu Ekle</h2>
    <p className="mt-1 text-sm text-slate-600">Uzun / büyük videoları YouTube’a yükleyip bağlantısını buraya yapıştırmanız siteyi hızlı tutar.</p>
    <div className="mt-4 grid gap-3 md:grid-cols-[2fr_2fr_1fr_auto]">
      <input className={input} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=… veya youtu.be/…" />
      <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video başlığı" />
      <select className={input} value={cat} onChange={(e) => setCat(e.target.value as Cat)}><option value="elektrik">Elektrik</option><option value="su">Su tesisatı</option></select>
      <button disabled={disabled || !url} onClick={add} className="rounded-md bg-navy px-5 py-2.5 font-bold text-white disabled:opacity-50">Ekle</button>
    </div>
  </section>);
}

function ItemCard({ m, onChange, flash, disabled }: { m: Media; onChange: () => void; flash: (ok: boolean, msg: string) => void; disabled: boolean }) {
  const [f, setF] = useState({ title: m.title, location: m.location ?? "", date: m.date ?? "", text: m.text ?? "", category: m.category });
  const [confirm, setConfirm] = useState(false), [saving, setSaving] = useState(false);
  const dirty = f.title !== m.title || f.location !== (m.location ?? "") || f.date !== (m.date ?? "") || f.text !== (m.text ?? "") || f.category !== m.category;
  async function save() {
    setSaving(true);
    const r = await fetch("/api/admin/gallery", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: m.key, ...f }) });
    setSaving(false); const d = await r.json().catch(() => ({}));
    if (r.ok) { flash(true, "Kaydedildi"); onChange(); } else flash(false, d.error || "Kaydedilemedi");
  }
  async function del() {
    const r = await fetch(`/api/admin/gallery?key=${encodeURIComponent(m.key)}`, { method: "DELETE" });
    if (r.ok) { flash(true, "Silindi"); onChange(); } else flash(false, (await r.json().catch(() => ({}))).error || "Silinemedi");
  }
  return (<article className="overflow-hidden rounded-xl bg-white shadow-sm">
    <div className="relative aspect-video bg-slate-200">
      {m.kind === "photo" ? <img src={m.src} alt="" className="h-full w-full object-cover" />
        : m.kind === "youtube" ? <img src={m.poster} alt="" className="h-full w-full object-cover" />
        : <video src={`${m.src}#t=0.5`} poster={m.poster} muted preload="metadata" controls className="h-full w-full object-cover" />}
      <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs font-bold uppercase text-white">{m.kind === "photo" ? "Fotoğraf" : m.kind === "video" ? "Video" : "YouTube"}</span>
      {m.kind === "youtube" && <Play className="absolute inset-0 m-auto text-white drop-shadow" size={40} />}
    </div>
    <div className="grid gap-2 p-4">
      <input className={input} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Başlık" aria-label="Başlık" />
      <div className="grid grid-cols-2 gap-2">
        <select className={input} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as Cat })} aria-label="Kategori"><option value="elektrik">Elektrik</option><option value="su">Su tesisatı</option></select>
        <input type="month" className={input} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} aria-label="Tarih" />
      </div>
      {m.kind !== "youtube" && <><input className={input} value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="Konum (örn: Haliliye)" aria-label="Konum" />
        <input className={input} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} placeholder="Kısa açıklama" aria-label="Açıklama" /></>}
      <div className="mt-1 flex items-center gap-2">
        <button disabled={disabled || !dirty || saving} onClick={save} className="inline-flex items-center gap-1 rounded-md bg-navy px-3 py-2 text-sm font-bold text-white disabled:opacity-40"><Save size={16} />{saving ? "…" : "Kaydet"}</button>
        {confirm
          ? <span className="ml-auto flex items-center gap-2 text-sm"><span className="font-semibold text-red-600">Silinsin mi?</span><button onClick={del} className="rounded-md bg-red-600 px-3 py-2 font-bold text-white">Evet, sil</button><button onClick={() => setConfirm(false)} className="rounded-md px-2 py-2 font-bold ring-1 ring-slate-300">Vazgeç</button></span>
          : <button disabled={disabled} onClick={() => setConfirm(true)} className="ml-auto inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-bold text-red-600 ring-1 ring-red-200 disabled:opacity-40"><Trash2 size={16} />Sil</button>}
      </div>
    </div>
  </article>);
}

/* ---------------- İŞLETME BİLGİLERİ ---------------- */
type F = { k: string; label: string; hint?: string; area?: boolean; group?: "social" | "google" };
const sections: [string, F[]][] = [
  ["Genel", [
    { k: "name", label: "İşletme adı" }, { k: "url", label: "Site adresi", hint: "https://ozgutesisat.com" }, { k: "shortName", label: "Kısa ad", hint: "WhatsApp mesajlarının başında kullanılır" },
    { k: "master", label: "Usta adı" }, { k: "experienceYears", label: "Deneyim (yıl)", hint: "Sadece sayı, örn: 15" },
    { k: "slogan", label: "Slogan", hint: "Ana sayfadaki büyük başlığın altındaki cümle" },
    { k: "about", label: "Hakkımızda", area: true, hint: "2-4 cümle" },
  ]],
  ["İletişim", [
    { k: "phone", label: "Telefon", hint: "+905xxxxxxxxx" }, { k: "whatsapp", label: "WhatsApp", hint: "905xxxxxxxxx (+ olmadan)" },
    { k: "email", label: "E-posta" }, { k: "hours", label: "Çalışma saatleri", hint: "örn: Hafta içi 08:00–19:00" },
    { k: "emergency", label: "Acil durum notu", hint: "örn: 7/24 acil arıza (doğruysa)" },
    { k: "city", label: "Şehir" }, { k: "district", label: "İlçe" }, { k: "address", label: "Açık adres" },
    { k: "serviceAreas", label: "Hizmet bölgeleri", hint: "Virgülle ayırın: Haliliye, Eyyübiye, Şahinbey" },
  ]],
  ["Sosyal medya", [
    { k: "instagram", label: "Instagram bağlantısı", group: "social" }, { k: "facebook", label: "Facebook bağlantısı", group: "social" }, { k: "youtube", label: "YouTube kanalı", group: "social" },
  ]],
  ["Google (entegrasyon aşamasında doldurulacak)", [
    { k: "mapsUrl", label: "Google Haritalar bağlantısı", group: "google" }, { k: "mapsEmbedUrl", label: "Harita yerleştirme (embed) adresi", group: "google", hint: "Haritalar > Paylaş > Harita yerleştir > src=\"…\" içindeki adres" },
    { k: "reviewUrl", label: "Google yorum bağlantısı", group: "google" }, { k: "analyticsId", label: "Google Analytics kimliği", group: "google", hint: "G-XXXXXXXXXX" },
    { k: "searchConsole", label: "Search Console doğrulama kodu", group: "google" },
  ]],
];

function InfoAdmin({ flash }: { flash: (ok: boolean, m: string) => void }) {
  const [s, setS] = useState<Record<string, any> | null>(null), [writable, setWritable] = useState(true), [saving, setSaving] = useState(false);
  useEffect(() => { fetch("/api/admin/site", { cache: "no-store" }).then((r) => r.json()).then((d) => { setS({ ...d.site, serviceAreas: (d.site.serviceAreas ?? []).join(", ") }); }); }, []);
  if (!s) return <p className="mt-6 text-slate-500">Yükleniyor…</p>;
  const get = (f: F) => (f.group ? s[f.group]?.[f.k] : s[f.k]) ?? "";
  const set = (f: F, v: string) => setS(f.group ? { ...s, [f.group]: { ...s[f.group], [f.k]: v } } : { ...s, [f.k]: v });
  async function save() {
    setSaving(true);
    const r = await fetch("/api/admin/site", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(s) });
    setSaving(false); const d = await r.json().catch(() => ({}));
    r.ok ? flash(true, "Bilgiler kaydedildi") : flash(false, d.error || "Kaydedilemedi");
  }
  return (<div className="mt-6 grid gap-6 pb-24">
    
    {sections.map(([h, fields]) => <section key={h} className="rounded-xl bg-white p-5 shadow-sm"><h2 className="font-display text-2xl font-bold">{h}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{fields.map((f) => <label key={f.k} className={`grid content-start gap-1 text-sm font-semibold ${f.area ? "md:col-span-2" : ""}`}>{f.label}
        {f.area ? <textarea rows={4} className={input} value={get(f)} onChange={(e) => set(f, e.target.value)} /> : <input className={input} value={get(f)} onChange={(e) => set(f, e.target.value)} />}
        {f.hint && <span className="font-normal text-slate-500">{f.hint}</span>}</label>)}</div></section>)}
    <div className="sticky bottom-4 flex justify-end"><button disabled={!writable || saving} onClick={save} className="inline-flex items-center gap-2 rounded-md bg-accent px-8 py-4 font-bold text-white shadow-lg disabled:opacity-50"><Save size={20} />{saving ? "Kaydediliyor…" : "Bilgileri Kaydet"}</button></div>
  </div>);
}
