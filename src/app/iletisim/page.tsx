import type { Metadata } from "next"; import { telHref, waHref, phoneText, isDev } from "@/config/site"; import { getSite } from "@/lib/site-server"; import QuoteForm from "@/components/QuoteForm"; import Fill from "@/components/Fill";
export const metadata: Metadata = { title: "İletişim", description: "Telefon, WhatsApp, adres ve teklif alma.", alternates: { canonical: "/iletisim" } };
export default async function C() {
  const site = await getSite(); const tel = () => telHref(site); const wa = (m: string) => waHref(site, m);
  const rows: [string, string, string, string?][] = [
    ["Telefon", "Telefon", site.phone && phoneText(site), tel()],
    ["WhatsApp", "WhatsApp", site.whatsapp && "WhatsApp’tan yazın", wa("Merhaba, bilgi almak istiyorum.")],
    ["Adres", "Adres", site.address],
    ["Hizmet bölgeleri", "Hizmet bölgeleri", site.serviceAreas.join(", ")],
    ["Çalışma saatleri", "Çalışma saatleri", site.hours],
    ["E-posta", "E-posta", site.email, site.email && `mailto:${site.email}`],
    ["Harita", "Google Haritalar bağlantısı", site.google.mapsUrl && "Google Haritalar’da aç", site.google.mapsUrl],
  ];
  return (<main className="mx-auto max-w-6xl px-4 py-12"><h1 className="font-display text-5xl font-bold">İletişim</h1>
    <div className="mt-8 grid gap-10 lg:grid-cols-2">
      <div><dl className="grid gap-4">{rows.filter((r) => r[2] || isDev).map(([k, l, v, h]) => <div key={k}><dt className="font-bold">{k}</dt><dd><Fill value={v} label={l}>{h ? <a className="text-accent underline" href={h} {...(k === "WhatsApp" && { "data-wa": "" })}>{v}</a> : v}</Fill></dd></div>)}</dl>
        <div className="mt-8">{site.google.mapsEmbedUrl
          ? <iframe src={site.google.mapsEmbedUrl} title="Konum" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="aspect-[4/3] w-full rounded-lg border-0" />
          : isDev && <div className="grid aspect-[4/3] place-items-center rounded-lg border-2 border-dashed border-accent bg-accent/5 p-6 text-center text-accent">✎ Google Harita alanı<br /><span className="text-sm">/admin → İşletme Bilgileri → Google (entegrasyon aşamasında)</span></div>}</div></div>
      <div className="rounded-xl bg-navy p-6 text-white"><h2 className="font-display text-3xl font-bold">Teklif Alın</h2><div className="mt-4"><QuoteForm /></div></div>
    </div></main>);
}
