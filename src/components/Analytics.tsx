"use client";
// Google Analytics yalnızca ziyaretçi çerezlere onay verirse yüklenir (KVKK).
// Ayrıca Google'ın "Consent Mode" sinyalleri gönderilir.
import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { usePathname } from "next/navigation";

const KEY = "cerez-onay";
type C = "evet" | "hayir" | null;
const read = (): C => { try { return localStorage.getItem(KEY) as C; } catch { return null; } };

export default function Analytics({ id }: { id: string }) {
  const [c, setC] = useState<C | "yukleniyor">("yukleniyor");
  const admin = (usePathname() ?? "").startsWith("/admin");
  useEffect(() => setC(read()), []);
  const set = (v: "evet" | "hayir") => { try { localStorage.setItem(KEY, v); } catch {} setC(v); };
  if (!id || admin) return null;
  return (<>
    {c === "evet" && <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
gtag('js',new Date());gtag('config','${id}',{anonymize_ip:true});`}</Script></>}
    {c === null && <div role="dialog" aria-label="Çerez tercihi" className="fixed inset-x-3 bottom-20 z-[65] mx-auto max-w-xl rounded-xl bg-white p-4 text-sm text-ink shadow-2xl ring-1 ring-slate-200 lg:bottom-6">
      <p>Sitemizi geliştirmek için ziyaret istatistiği (Google Analytics) çerezleri kullanmak istiyoruz. <Link href="/gizlilik" className="font-semibold underline">Ayrıntılar</Link></p>
      <div className="mt-3 flex justify-end gap-2">
        <button onClick={() => set("hayir")} className="min-h-11 rounded-md px-5 font-bold ring-1 ring-slate-300">Reddet</button>
        <button onClick={() => set("evet")} className="min-h-11 rounded-md bg-navy px-5 font-bold text-white">Kabul et</button>
      </div></div>}
  </>);
}
