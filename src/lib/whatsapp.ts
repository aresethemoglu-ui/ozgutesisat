import type { SiteInfo } from "@/config/site";

// WhatsApp konu seçenekleri — mesaj metinlerini buradan düzenleyebilirsiniz.
export type WaTopic = { id: string; icon: string; title: string; desc: string; body: string; fields: string[] };
export const waTopics: WaTopic[] = [
  { id: "elektrik", icon: "⚡", title: "Elektrik tesisatı işim var", desc: "Kurulum, hat yenileme, priz, pano, aydınlatma",
    body: "Elektrik tesisatı ile ilgili bir işim var. Keşif ve fiyat bilgisi almak istiyorum.", fields: ["Yapılacak iş", "İlçe / mahalle", "Uygun gün ve saat"] },
  { id: "su", icon: "💧", title: "Su tesisatı işim var", desc: "Kurulum, boru değişimi, banyo, mutfak, gider",
    body: "Su tesisatı ile ilgili bir işim var. Keşif ve fiyat bilgisi almak istiyorum.", fields: ["Yapılacak iş", "İlçe / mahalle", "Uygun gün ve saat"] },
  { id: "ariza", icon: "🚨", title: "Acil arıza var", desc: "Elektrik kesintisi, kısa devre, boru patlağı",
    body: "ACİL bir arıza için destek istiyorum.", fields: ["Arıza türü (elektrik / su)", "Kısaca ne oldu", "Adres / ilçe"] },
  { id: "kacak", icon: "🔍", title: "Su kaçağı tespiti", desc: "Fatura artışı, nem, rutubet, sayaç dönmesi",
    body: "Su kaçağı tespiti yaptırmak istiyorum.", fields: ["Belirtiler (nem, fatura artışı vb.)", "İlçe / mahalle", "Uygun gün ve saat"] },
  { id: "teklif", icon: "🧾", title: "Fiyat teklifi / keşif randevusu", desc: "Tadilat, komple yenileme, yeni yapı",
    body: "Bir iş için fiyat teklifi ve keşif randevusu almak istiyorum.", fields: ["İşin kapsamı", "Konut / iş yeri büyüklüğü", "İlçe / mahalle"] },
  { id: "diger", icon: "💬", title: "Başka bir konu", desc: "Soru, bilgi, diğer talepler",
    body: "Bilgi almak istiyorum.", fields: ["Konu"] },
];

export const waMessage = (site: SiteInfo, t: WaTopic) =>
  [`Merhaba ${site.shortName || site.name},`, "", t.body, "", ...t.fields.map((f) => `• ${f}: `), "", "(Varsa fotoğraf / video da gönderebilirim.)"].join("\n");
