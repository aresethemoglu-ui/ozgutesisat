import type { Metadata } from "next"; import { getGallery } from "@/lib/gallery"; import Gallery from "@/components/Gallery"; import { telHref, waHref, phoneText, isDev } from "@/config/site"; import { getSite } from "@/lib/site-server";
export async function generateMetadata(): Promise<Metadata> { const site = await getSite(); return { title: "Çalışmalarımız", description: `${site.name} tarafından tamamlanan elektrik ve su tesisatı işlerinden fotoğraf ve videolar.`, alternates: { canonical: "/calismalarimiz" } }; }
export default async function Page() {
  const site = await getSite(); const tel = () => telHref(site); const wa = (m: string) => waHref(site, m);
  const items = (await getGallery());
  const n = (c: string) => items.filter((m) => m.category === c).length;
  return (<main className="bg-mist"><div className="mx-auto max-w-6xl px-4 py-12">
    <h1 className="font-display text-5xl font-bold">Çalışmalarımız</h1>
    <p className="mt-3 max-w-2xl text-lg text-slate-600">Gerçek müşterilerimiz için tamamladığımız elektrik ve su tesisatı işlerinden fotoğraf ve videolar.</p>
    {items.length > 0 && <p className="mt-2 text-sm text-slate-500">{n("elektrik")} elektrik · {n("su")} su tesisatı · {items.filter((m) => m.kind !== "photo").length} video</p>}
    <Gallery items={items} />
    <div className="mt-12 rounded-xl bg-navy p-8 text-white"><p className="font-display text-3xl font-bold">Benzer bir iş mi yaptıracaksınız?</p>
      <a data-wa href={wa("Merhaba, sitenizdeki çalışmalarınızı gördüm, benzer bir iş için teklif almak istiyorum.")} className="mt-4 inline-block rounded-md bg-accent px-6 py-3 font-bold">WhatsApp’tan Teklif Al</a></div>
  </div></main>);
}
