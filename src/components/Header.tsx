"use client";
import Link from "next/link"; import { useState } from "react"; import { Menu, X, Phone, MessageCircle } from "lucide-react";
import { telHref, waHref, phoneText } from "@/config/site"; import { useSite } from "./SiteProvider";
const nav = [["Ana Sayfa", "/"], ["Hizmetlerimiz", "/#hizmetler"], ["Çalışmalarımız", "/calismalarimiz"], ["Hakkımızda", "/#hakkimizda"], ["SSS", "/#sss"], ["İletişim", "/iletisim"]];
export default function Header() {
  const [o, s] = useState(false); const site = useSite(); const tel = () => telHref(site); const wa = (m: string) => waHref(site, m);
  return (<>
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 text-navy backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="shrink-0">{site.logo ? <img src={site.logo} alt={site.name} className="h-11 w-auto" /> : <span className="font-display text-2xl font-bold">{site.name}</span>}</Link>
        <nav className="hidden gap-6 font-semibold lg:flex">{nav.map(([t, h]) => <Link key={h} href={h} className="hover:text-accent">{t}</Link>)}</nav>
        {site.phone && <a href={tel()} className="hidden items-center gap-2 rounded-md bg-accent px-4 py-2 font-bold text-white lg:flex"><Phone size={18} />{phoneText(site)}</a>}
        <button className="-mr-2 grid h-11 w-11 place-items-center lg:hidden" aria-label="Menü" aria-expanded={o} onClick={() => s(!o)}>{o ? <X /> : <Menu />}</button>
      </div>
      {o && <nav className="grid gap-1 border-t border-slate-200 px-4 pb-4 lg:hidden">{nav.map(([t, h]) => <Link key={h} href={h} onClick={() => s(false)} className="py-3 text-lg font-semibold">{t}</Link>)}</nav>}
    </header>
    <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 lg:hidden">
      <a href={tel()} className="flex items-center justify-center gap-2 bg-accent py-4 font-bold text-white"><Phone size={20} />Hemen Ara</a>
      <a data-wa href={wa("Merhaba, bilgi almak istiyorum.")} className="flex items-center justify-center gap-2 bg-green-700 py-4 font-bold text-white"><MessageCircle size={20} />WhatsApp</a>
    </div>
  </>);
}
