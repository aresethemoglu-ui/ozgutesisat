import type { Metadata } from "next";
import { Barlow_Condensed, Source_Sans_3 } from "next/font/google"; import "./globals.css";
import Header from "@/components/Header"; import Footer from "@/components/Footer"; import WhatsAppPicker from "@/components/WhatsAppPicker";
import { SiteProvider } from "@/components/SiteProvider"; import Analytics from "@/components/Analytics";
import { getSite } from "@/lib/site-server";

const display = Barlow_Condensed({ subsets: ["latin", "latin-ext"], weight: ["600", "700"], variable: "--font-display" });
const body = Source_Sans_3({ subsets: ["latin", "latin-ext"], variable: "--font-body" });
export const revalidate = 300; // canlıda sayfalar 5 dk'da bir (ve admin'de kayıt yapılınca hemen) yenilenir

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const desc = `${site.city} bölgesinde elektrik ve su tesisatı: kurulum, arıza tespiti, su kaçağı, pano, aydınlatma, banyo ve mutfak tesisatı.`;
  return {
    metadataBase: new URL(site.url),
    title: { default: `${site.name} | Elektrik ve Su Tesisatı`, template: `%s | ${site.name}` },
    description: desc,
    icons: { icon: "/images/logo.svg" },
    alternates: { canonical: "/" },
    openGraph: { type: "website", locale: "tr_TR", siteName: site.name, description: desc, url: site.url },
    ...(site.google.searchConsole && { verification: { google: site.google.searchConsole } }),
  };
}

export default async function Root({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  const ld = {
    "@context": "https://schema.org", "@type": ["LocalBusiness", "Electrician", "Plumber"], "@id": `${site.url}/#isletme`,
    name: site.name, url: site.url, image: `${site.url}${site.logo}`, logo: `${site.url}${site.logo}`,
    description: `${site.city} bölgesinde elektrik ve su tesisatı hizmeti.`,
    ...(site.phone && { telephone: site.phone }), ...(site.email && { email: site.email }),
    ...(site.address && { address: { "@type": "PostalAddress", streetAddress: site.address, addressLocality: site.district || undefined, addressRegion: site.city, addressCountry: "TR" } }),
    ...(site.serviceAreas.length && { areaServed: site.serviceAreas.map((n) => ({ "@type": "City", name: n })) }),
    ...(site.google.mapsUrl && { hasMap: site.google.mapsUrl }),
    ...((site.social.instagram || site.social.facebook || site.social.youtube) && { sameAs: [site.social.instagram, site.social.facebook, site.social.youtube].filter(Boolean) }),
  };
  return (<html lang="tr" className={`${display.variable} ${body.variable}`}><body className="bg-white pb-14 font-body text-ink lg:pb-0">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    <SiteProvider site={site}>
      <Header />{children}<Footer /><WhatsAppPicker />
      <Analytics id={site.google.analyticsId} />
    </SiteProvider>
  </body></html>);
}
