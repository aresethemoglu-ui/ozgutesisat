"use client";
import { useEffect, useState } from "react";
import { Camera, Film, Play, X, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import type { Media } from "@/lib/gallery";
import { isDev } from "@/config/site";

const filters = [
  ["all", "Tümü"], ["elektrik", "Elektrik"], ["su", "Su"], ["photo", "Fotoğraf"], ["video", "Video"],
] as const;
type F = (typeof filters)[number][0];

export default function Gallery({ items, limit, showFilters = true }: { items: Media[]; limit?: number; showFilters?: boolean }) {
  const [f, setF] = useState<F>("all");
  const [open, setOpen] = useState<number | null>(null);
  const shown = items
    .filter((m) => f === "all" || m.category === f || (f === "photo" ? m.kind === "photo" : f === "video" && m.kind !== "photo"))
    .slice(0, limit);

  useEffect(() => {
    if (open === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i! + 1) % shown.length);
      if (e.key === "ArrowLeft") setOpen((i) => (i! - 1 + shown.length) % shown.length);
    };
    document.addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open, shown.length]);

  if (!items.length) return isDev ? <Placeholders /> : <p className="mt-6 rounded-lg bg-white p-6 text-slate-600 ring-1 ring-slate-200">Çalışma fotoğraflarımız ve videolarımız çok yakında burada olacak.</p>;
  const cur = open !== null ? shown[open] : null;

  return (<>
    {showFilters && <div className="mt-6 flex flex-wrap gap-2">{filters.map(([k, t]) =>
      <button key={k} onClick={() => setF(k)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${f === k ? "bg-navy text-white" : "bg-white text-navy ring-1 ring-slate-300 hover:ring-navy"}`}>{t}</button>)}</div>}
    <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {shown.map((m, i) => (
        <button key={m.key} onClick={() => setOpen(i)} className="group relative aspect-square overflow-hidden rounded-lg bg-slate-200 text-left">
          {m.kind === "photo"
            ? <img src={m.src} alt={m.title} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
            : m.poster
              ? <img src={m.poster} alt={m.title} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
              : <video src={`${m.src}#t=0.5`} muted playsInline preload="metadata" className="h-full w-full object-cover" />}
          {m.kind !== "photo" && <span className="absolute inset-0 grid place-items-center"><span className="grid h-14 w-14 place-items-center rounded-full bg-accent/90 text-white shadow-lg"><Play className="ml-1" /></span></span>}
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 text-sm font-semibold text-white">
            <span className="mb-1 inline-block rounded bg-white/20 px-2 py-0.5 text-[11px] uppercase tracking-wider">{m.category === "su" ? "Su" : "Elektrik"}</span>
            <span className="block leading-tight">{m.title}</span>
          </span>
        </button>))}
    </div>
    {!shown.length && <p className="mt-6 text-slate-600">Bu kategoride henüz içerik yok.</p>}

    {cur && <div role="dialog" aria-modal="true" aria-label={cur.title} className="fixed inset-0 z-[60] flex flex-col bg-black/95 p-4" onClick={() => setOpen(null)}>
      <div className="flex items-center justify-between text-white"><p className="font-bold">{cur.title}</p>
        <button aria-label="Kapat" className="p-2" onClick={() => setOpen(null)}><X /></button></div>
      <div className="relative flex flex-1 items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {cur.kind === "photo" && <img src={cur.src} alt={cur.title} className="max-h-[78vh] max-w-full rounded object-contain" />}
        {cur.kind === "video" && <video key={cur.src} src={cur.src} poster={cur.poster} controls autoPlay playsInline className="max-h-[78vh] max-w-full rounded" />}
        {cur.kind === "youtube" && <iframe key={cur.src} src={`https://www.youtube-nocookie.com/embed/${cur.src}?autoplay=1`} title={cur.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="aspect-video w-full max-w-4xl rounded" />}
        {shown.length > 1 && <>
          <button aria-label="Önceki" onClick={() => setOpen((open! - 1 + shown.length) % shown.length)} className="absolute left-0 rounded-full bg-white/15 p-3 text-white hover:bg-white/30"><ChevronLeft /></button>
          <button aria-label="Sonraki" onClick={() => setOpen((open! + 1) % shown.length)} className="absolute right-0 rounded-full bg-white/15 p-3 text-white hover:bg-white/30"><ChevronRight /></button></>}
      </div>
      {(cur.text || cur.location) && <div className="mx-auto max-w-2xl pt-3 text-center text-white/80" onClick={(e) => e.stopPropagation()}>
        {cur.text && <p>{cur.text}</p>}
        {cur.location && <p className="mt-1 inline-flex items-center gap-1 text-sm"><MapPin size={14} />{cur.location}{cur.date && ` · ${cur.date}`}</p>}</div>}
    </div>}
  </>);
}

function Placeholders() {
  const slot = "grid aspect-square place-items-center rounded-lg border-2 border-dashed border-slate-300 bg-white/60 p-3 text-center text-sm text-slate-500";
  return (<div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
    {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className={slot}><span><Camera className="mx-auto mb-2" />Fotoğraf alanı</span></div>)}
    {[1, 2].map((i) => <div key={`v${i}`} className={slot}><span><Film className="mx-auto mb-2" />Video alanı</span></div>)}
  </div>);
}
