// İşletme bilgileri: yerelde data/site.json, canlıda Netlify Blobs. /admin → İşletme Bilgileri'nden düzenlenir.
// Sunucu bileşenleri getSite() (src/lib/site-server.ts), istemci bileşenleri useSite() (SiteProvider) kullanır.
import defaults from "../../data/site.json";

export type SiteInfo = {
  name: string; shortName: string; master: string; slogan: string; about: string; experienceYears: string;
  phone: string; whatsapp: string; email: string; city: string; district: string; address: string;
  hours: string; emergency: string; logo: string;
  social: { instagram: string; facebook: string; youtube: string };
  serviceAreas: string[]; url: string;
  google: { analyticsId: string; searchConsole: string; mapsEmbedUrl: string; mapsUrl: string; reviewUrl: string };
};
export const defaultSite = defaults as SiteInfo;

export function mergeSite(saved: Partial<SiteInfo> | null | undefined): SiteInfo {
  const s = saved ?? {};
  return { ...defaultSite, ...s, social: { ...defaultSite.social, ...s.social }, google: { ...defaultSite.google, ...s.google } };
}

export const telHref = (s: SiteInfo) => (s.phone ? `tel:${s.phone}` : "/iletisim");
export const waHref = (s: SiteInfo, msg: string) =>
  s.whatsapp ? `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(msg)}` : "/iletisim";
export const phoneText = (s: SiteInfo) => s.phone.replace(/^\+90(\d{3})(\d{3})(\d{2})(\d{2})$/, "0$1 $2 $3 $4");
export const isDev = process.env.NODE_ENV !== "production";
