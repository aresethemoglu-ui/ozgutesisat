"use client";
// Sayfadaki data-wa özellikli her bağlantı tıklanınca konu seçme penceresi açılır.
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, ChevronRight } from "lucide-react";
import { waHref } from "@/config/site"; import { useSite } from "./SiteProvider";
import { waTopics, waMessage } from "@/lib/whatsapp";

export default function WhatsAppPicker() {
  const [open, setOpen] = useState(false);
  const site = useSite();
  const admin = (usePathname() ?? "").startsWith("/admin");
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("[data-wa]");
      if (!a || e.metaKey || e.ctrlKey) return;
      e.preventDefault(); setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", onClick); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("click", onClick); document.removeEventListener("keydown", onKey); };
  }, []);
  if (!site.whatsapp || admin) return null;

  return (<>
    <button data-wa aria-label="WhatsApp’tan yazın" className="fixed bottom-6 right-6 z-50 hidden h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105 lg:grid"><MessageCircle size={28} /></button>
    {open && <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={() => setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-labelledby="wa-title" onClick={(e) => e.stopPropagation()} className="wa-pop max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white sm:max-w-md sm:rounded-2xl">
        <div className="flex items-start gap-3 bg-[#075E54] p-5 text-white sm:rounded-t-2xl">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15"><MessageCircle /></span>
          <div className="flex-1"><p id="wa-title" className="font-bold">{site.shortName || site.name}</p><p className="text-sm text-white/80">Size nasıl yardımcı olabiliriz? Konuyu seçin, mesajınız hazır gelsin.</p></div>
          <button aria-label="Kapat" onClick={() => setOpen(false)} className="p-1"><X /></button>
        </div>
        <ul className="divide-y divide-slate-100 p-2">{waTopics.map((t) => (
          <li key={t.id}><a href={waHref(site, waMessage(site, t))} target="_blank" rel="noopener" onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg p-3 hover:bg-mist">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mist text-xl">{t.icon}</span>
            <span className="flex-1"><span className="block font-bold text-ink">{t.title}</span><span className="block text-sm text-slate-500">{t.desc}</span></span>
            <ChevronRight className="text-slate-400" size={18} /></a></li>))}</ul>
        <p className="px-5 pb-5 text-center text-xs text-slate-500">WhatsApp açılınca mesajdaki boşlukları doldurup gönderin.</p>
      </div></div>}
  </>);
}
