import Link from "next/link"; import { Phone, MapPin, Clock, Mail, Instagram, Facebook, Youtube } from "lucide-react";
import { telHref, waHref, phoneText, isDev } from "@/config/site"; import { getSite } from "@/lib/site-server"; import { services } from "@/lib/services"; import Fill from "./Fill"; import AdminButton from "./admin/AdminButton";
export default async function Footer() {
  const site = await getSite(); const tel = () => telHref(site); const wa = (m: string) => waHref(site, m);
  const so = [[site.social.instagram, Instagram, "Instagram"], [site.social.facebook, Facebook, "Facebook"], [site.social.youtube, Youtube, "YouTube"]] as const;
  return (<footer className="bg-ink py-12 text-white/80"><div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-3">
    <div><p className="font-display text-2xl font-bold text-white">{site.name}</p>
      <p className="mt-2">{site.city} bölgesinde elektrik ve su tesisatı hizmeti.</p>
      <div className="mt-4 flex gap-3">{so.filter(([u]) => u).map(([u, I, t]) => <a key={t} href={u} aria-label={t} target="_blank" rel="noopener" className="rounded-full bg-white/10 p-2 hover:bg-accent"><I size={18} /></a>)}</div></div>
    <div><p className="font-bold text-white">Hizmetler</p><ul className="mt-2 grid">{services.map((s) => <li key={s.slug}><Link href={`/hizmetler/${s.slug}`} className="inline-block py-2 hover:text-accent">{s.title}</Link></li>)}</ul></div>
    <div className="grid content-start gap-3"><p className="font-bold text-white">İletişim</p>
      {site.phone && <a href={tel()} className="-my-2 flex gap-2 py-2 hover:text-accent"><Phone size={18} />{phoneText(site)}</a>}
      <p className="flex gap-2"><MapPin size={18} className="shrink-0" /><Fill value={site.address} label="Adres" /></p>
      <p className="flex gap-2"><Clock size={18} className="shrink-0" /><Fill value={site.hours} label="Çalışma saatleri" /></p>
      {site.email && <a href={`mailto:${site.email}`} className="flex gap-2 hover:text-accent"><Mail size={18} />{site.email}</a>}</div>
  </div><div className="mx-auto mt-10 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 pt-6 text-sm text-white/50"><p>© {new Date().getFullYear()} {site.name} · <Link href="/gizlilik" className="inline-block py-2 hover:text-white">Gizlilik ve Çerezler</Link></p><AdminButton className="text-white/70 lg:mr-20" /></div></footer>);
}
