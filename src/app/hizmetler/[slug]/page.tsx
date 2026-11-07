import { notFound } from "next/navigation"; import type { Metadata } from "next"; import Link from "next/link"; import { Check, Phone } from "lucide-react";
import { services, groups } from "@/lib/services"; import { telHref, waHref, phoneText, isDev } from "@/config/site"; import { getSite } from "@/lib/site-server"; import { getGallery } from "@/lib/gallery"; import Gallery from "@/components/Gallery";
export const generateStaticParams = () => services.map((s) => ({ slug: s.slug }));
export const dynamicParams = false;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const s = services.find((x) => x.slug === slug); if (!s) return {}; const site = await getSite();
  return { title: s.title, description: `${s.intro} ${site.city}.`, openGraph: { title: s.title, description: s.intro }, alternates: { canonical: `/hizmetler/${s.slug}` } };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const site = await getSite(); const tel = () => telHref(site); const wa = (m: string) => waHref(site, m);
  const { slug } = await params; const s = services.find((x) => x.slug === slug); if (!s) notFound();
  const ld = { "@context": "https://schema.org", "@type": "Service", name: s.title, description: s.intro, serviceType: groups[s.group].title, provider: { "@type": "LocalBusiness", name: site.name, telephone: site.phone || undefined }, ...(site.serviceAreas.length && { areaServed: site.serviceAreas }) };
  const related = services.filter((x) => x.group === s.group && x.slug !== s.slug);
  const media = (await getGallery()).filter((m) => m.category === s.group);
  return (<main className="mx-auto max-w-6xl px-4 py-12"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    <p className="text-sm font-bold uppercase tracking-wider text-accent">{groups[s.group].title}</p>
    <h1 className="mt-1 font-display text-5xl font-bold">{s.title}</h1><p className="mt-3 max-w-2xl text-lg text-slate-600">{s.intro}</p>
    <ul className="mt-6 grid gap-3 sm:grid-cols-2">{s.items.map((i) => <li key={i} className="flex gap-2"><Check className="shrink-0 text-accent" />{i}</li>)}</ul>
    {s.note && <p className="mt-6 border-l-4 border-accent bg-mist p-4">{s.note}</p>}
    <div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href={wa([`Merhaba ${site.shortName || site.name},`, "", `${s.title} hizmeti için yazıyorum; ${s.msg}. Fiyat ve keşif hakkında bilgi alabilir miyim?`, "", "• Yapılacak iş: ", "• İlçe / mahalle: ", "• Uygun gün ve saat: ", "", "(Varsa fotoğraf / video da gönderebilirim.)"].join("\n"))} className="rounded-md bg-accent px-6 py-4 text-center font-bold text-white">WhatsApp’tan Teklif Al</a><a href={tel()} className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-navy px-6 py-4 font-bold text-navy"><Phone size={20} />Hemen Ara</a></div>
    <h2 className="mt-14 font-display text-3xl font-bold">{groups[s.group].title} çalışmalarımız</h2>
    <Gallery items={media} limit={8} showFilters={false} />
    {related.length > 0 && <><h2 className="mt-14 font-display text-3xl font-bold">Diğer {groups[s.group].title.toLocaleLowerCase("tr")} hizmetleri</h2>
      <div className="mt-4 flex flex-wrap gap-3">{related.map((r) => <Link key={r.slug} href={`/hizmetler/${r.slug}`} className="rounded-full bg-mist px-4 py-2 font-bold hover:bg-accent hover:text-white">{r.title}</Link>)}</div></>}
  </main>);
}
