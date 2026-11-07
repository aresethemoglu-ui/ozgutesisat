import Link from "next/link";
import { Phone, MessageCircle, ShieldCheck, Handshake, Clock3, BadgeCheck, Zap, Droplets, ArrowRight, Star, Search, FileText, Wrench, CheckCircle2 } from "lucide-react";
import { services, groups } from "@/lib/services"; import { telHref, waHref, phoneText, isDev } from "@/config/site"; import { getSite } from "@/lib/site-server";
import { getGallery } from "@/lib/gallery"; import { reviews } from "@/content/yorumlar";
import Icon from "@/components/Icon"; import QuoteForm from "@/components/QuoteForm"; import Gallery from "@/components/Gallery"; import Fill from "@/components/Fill";

const why = [[ShieldCheck, "Güvenli ve titiz işçilik", "Standartlara uygun malzeme ve temiz uygulama."], [Handshake, "Şeffaf fiyat", "İş başlamadan net teklif, sürpriz masraf yok."], [Clock3, "Zamanında hizmet", "Randevuya sadık, hızlı dönüş."], [BadgeCheck, "Kontrollü teslim", "İş bitince test edilip teslim edilir."]] as const;
const steps = [[Search, "Keşif", "Yerinde inceleme ve arıza / ihtiyaç tespiti."], [FileText, "Teklif", "Malzeme ve işçilik dahil net fiyat."], [Wrench, "Uygulama", "Planlanan sürede temiz uygulama."], [CheckCircle2, "Test ve teslim", "Elektrik ve su hatları test edilerek teslim."]] as const;
const faq = [
  ["Su kaçağı nasıl anlaşılır?", "Açıklanamayan fatura artışı, duvarda nem ve küf, zeminde ıslaklık ve tüm musluklar kapalıyken sayacın dönmesi en yaygın belirtilerdir."],
  ["Su kaçağı tespiti için duvar kırılır mı?", "Önce kaçağın yeri tespit edilir; müdahale mümkün olan en küçük alanla sınırlı tutulur. Durum keşifte netleşir."],
  ["Elektrik tesisatı ne zaman yenilenmeli?", "Sık sigorta atması, ısınan priz ve kablolar, yanık kokusu, topraklaması olmayan veya 20 yılı aşkın hatlar yenileme sinyalidir."],
  ["Kaçak akım rölesi neden önemli?", "Kaçak akım rölesi, insan vücudu üzerinden akım kaçağında devreyi keserek çarpılma riskini azaltır. Panoda bulunması gerekir."],
  ["Fiyat nasıl belirlenir?", "İşin kapsamı, malzeme ve süreye göre belirlenir. Fotoğraf veya video gönderirseniz WhatsApp üzerinden ön bilgi verilebilir; net fiyat keşif sonrası verilir."],
];

export default async function Home() {
  const site = await getSite(); const tel = () => telHref(site); const wa = (m: string) => waHref(site, m);
  const gallery = (await getGallery());
  return (<main>
    {/* HERO */}
    <section className="relative overflow-hidden bg-navy text-white">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      <div className="hero-in relative mx-auto max-w-6xl px-4 py-14 md:py-24">
        <div className="flex flex-wrap gap-2"><span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm font-bold"><Zap size={16} className="text-accent" />Elektrik</span><span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm font-bold"><Droplets size={16} className="text-sky-300" />Su Tesisatı</span><span className="rounded-full bg-white/10 px-3 py-1 text-sm">{site.city}</span></div>
        <h1 className="mt-5 max-w-3xl font-display text-5xl font-bold leading-[1.02] md:text-7xl">Elektrik ve Su Tesisatında Güvenilir Usta</h1>
        <p className="mt-5 max-w-xl text-lg text-white/80">{site.slogan || "Kurulum, arıza tespiti, su kaçağı, pano, aydınlatma, banyo ve mutfak tesisatı — tek telefonla."}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href={tel()} className="flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-4 font-bold"><Phone size={20} />Hemen Ara</a><a data-wa href={wa("Merhaba, teklif almak istiyorum.")} className="flex items-center justify-center gap-2 rounded-md border-2 border-white px-6 py-4 font-bold"><MessageCircle size={20} />WhatsApp’tan Teklif Al</a><Link href="/calismalarimiz" className="px-6 py-4 text-center font-bold underline">Yaptığımız İşler</Link></div>
        <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 text-white/90">
          <div><dt className="text-sm text-white/60">Deneyim</dt><dd className="font-display text-3xl font-bold"><Fill value={site.experienceYears && `${site.experienceYears}+ yıl`} label="Deneyim yılı" /></dd></div>
          {gallery.length > 0 && <div><dt className="text-sm text-white/60">Galerideki iş</dt><dd className="font-display text-3xl font-bold">{gallery.length}</dd></div>}
          {site.emergency && <div><dt className="text-sm text-white/60">Acil durum</dt><dd className="font-display text-3xl font-bold">{site.emergency}</dd></div>}
        </dl>
      </div>
    </section>

    {/* HİZMETLER */}
    <section id="hizmetler" className="scroll-mt-16 bg-mist py-14"><div className="mx-auto max-w-6xl px-4">
      <h2 className="font-display text-4xl font-bold">Hizmetlerimiz</h2>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">{(Object.keys(groups) as (keyof typeof groups)[]).map((g) => (
        <div key={g} className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3"><span className={`grid h-12 w-12 place-items-center rounded-lg ${g === "su" ? "bg-sky-100 text-sky-700" : "bg-orange-100 text-accent"}`}><Icon name={groups[g].icon} className="h-7 w-7" /></span><h3 className="font-display text-3xl font-bold">{groups[g].title}</h3></div>
          <p className="mt-3 text-slate-600">{groups[g].text}</p>
          <ul className="mt-5 divide-y divide-slate-100">{services.filter((s) => s.group === g).map((s) => (
            <li key={s.slug}><Link href={`/hizmetler/${s.slug}`} className="group flex items-center gap-3 py-4"><Icon name={s.icon} className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-accent" /><span className="flex-1"><span className="block font-bold">{s.title}</span><span className="block text-sm text-slate-600">{s.intro}</span></span><ArrowRight size={18} className="text-slate-400 group-hover:text-accent" /></Link></li>))}</ul>
        </div>))}</div>
    </div></section>

    {/* ÇALIŞMALARIMIZ */}
    {(gallery.length > 0 || isDev) && <section id="calismalar" className="scroll-mt-16 py-14"><div className="mx-auto max-w-6xl px-4">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="font-display text-4xl font-bold">Yaptığımız İşler</h2><p className="mt-2 text-slate-600">Tamamladığımız elektrik ve su tesisatı işlerinden fotoğraf ve videolar.</p></div>
        {gallery.length > 8 && <Link href="/calismalarimiz" className="inline-flex items-center gap-1 font-bold text-navy underline">Tümünü gör ({gallery.length})<ArrowRight size={18} /></Link>}</div>
      <Gallery items={gallery} limit={8} showFilters={gallery.length > 4} />
      {isDev && !gallery.length && <p className="mt-4 rounded border border-dashed border-accent bg-accent/10 p-3 text-sm text-accent">✎ Fotoğraf/video eklemek için dosyaları <code>public/galeri/elektrik</code> veya <code>public/galeri/su</code> klasörüne atın (bu not canlı sitede görünmez).</p>}
    </div></section>}

    {/* HAKKIMIZDA */}
    <section id="hakkimizda" className="scroll-mt-16 bg-mist py-14"><div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2">
      <div><h2 className="font-display text-4xl font-bold">Hakkımızda</h2>
        <p className="mt-4 text-lg text-slate-700"><Fill value={site.about} label="Hakkımızda metni" /></p>
        <p className="mt-4 font-bold"><Fill value={site.master && `Usta: ${site.master}`} label="Usta adı" /></p>
        {site.serviceAreas.length > 0 ? <p className="mt-4 text-slate-700"><b>Hizmet bölgeleri:</b> {site.serviceAreas.join(", ")}</p> : <p className="mt-4"><Fill value="" label="Hizmet bölgeleri" /></p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{why.map(([I, t, d]) => <div key={t} className="rounded-lg border-l-4 border-accent bg-white p-5"><I className="text-navy" /><p className="mt-2 font-bold">{t}</p><p className="mt-1 text-sm text-slate-600">{d}</p></div>)}</div>
    </div></section>

    {/* NASIL ÇALIŞIYORUZ */}
    <section className="py-14"><div className="mx-auto max-w-6xl px-4"><h2 className="font-display text-4xl font-bold">Nasıl Çalışıyoruz?</h2>
      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{steps.map(([I, t, d], i) => <li key={t} className="relative rounded-lg border border-slate-200 p-5"><span className="absolute right-4 top-3 font-display text-4xl font-bold text-slate-200">{i + 1}</span><I className="text-accent" /><p className="mt-3 font-bold">{t}</p><p className="mt-1 text-sm text-slate-600">{d}</p></li>)}</ol>
    </div></section>

    {/* YORUMLAR */}
    {(reviews.length > 0 || isDev) && <section className="bg-mist py-14"><div className="mx-auto max-w-6xl px-4"><h2 className="font-display text-4xl font-bold">Müşteri Yorumları</h2>
      {reviews.length ? <div className="mt-8 grid gap-4 md:grid-cols-3">{reviews.map((r) => <figure key={r.name + r.text} className="rounded-lg bg-white p-5 shadow-sm">{r.rating && <div className="flex text-amber-500">{Array.from({ length: r.rating }, (_, i) => <Star key={i} size={16} fill="currentColor" />)}</div>}<blockquote className="mt-2 text-slate-700">“{r.text}”</blockquote><figcaption className="mt-3 text-sm font-bold">{r.name}{r.area && <span className="font-normal text-slate-500"> · {r.area}</span>}</figcaption></figure>)}</div>
        : <p className="mt-4 rounded border border-dashed border-accent bg-accent/10 p-3 text-sm text-accent">✎ Gerçek yorumları <code>src/content/yorumlar.ts</code> dosyasına ekleyin. Liste boşken bu bölüm canlı sitede görünmez.</p>}
      {site.google.reviewUrl && <a href={site.google.reviewUrl} target="_blank" rel="noopener" className="mt-6 inline-flex items-center gap-2 font-bold text-navy underline"><Star size={18} />Google’da yorum yazın</a>}
    </div></section>}

    {/* SSS */}
    <section id="sss" className="scroll-mt-16 py-14"><div className="mx-auto max-w-3xl px-4"><h2 className="font-display text-4xl font-bold">Sık Sorulan Sorular</h2>
      {faq.map(([q, a]) => <details key={q} className="mt-3 rounded-md border border-slate-200 p-4"><summary className="cursor-pointer font-bold">{q}</summary><p className="mt-2 text-slate-700">{a}</p></details>)}</div></section>

    {/* TEKLİF */}
    <section id="iletisim" className="bg-navy py-14 text-white"><div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2">
      <div><h2 className="font-display text-4xl font-bold">Ücretsiz Teklif Alın</h2><p className="mt-3 text-white/80">Formu doldurun, mesajınız WhatsApp’a hazır olarak gelsin. İsterseniz arızanın fotoğrafını da ekleyin.</p>
        <a href={tel()} className="mt-6 inline-flex items-center gap-2 rounded-md bg-accent px-6 py-4 font-bold"><Phone size={20} />Hemen Ara</a></div>
      <QuoteForm /></div></section>
  </main>);
}
