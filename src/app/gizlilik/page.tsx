import type { Metadata } from "next";
import { getSite } from "@/lib/site-server";
import Fill from "@/components/Fill";

export const metadata: Metadata = { title: "Gizlilik ve Çerez Politikası", alternates: { canonical: "/gizlilik" } };

// ŞABLON METİN — yayına almadan önce işletme bilgileriyle kontrol edin; gerekirse bir hukukçuya danışın.
export default async function Gizlilik() {
  const site = await getSite();
  return (<main className="mx-auto max-w-3xl px-4 py-12 text-slate-700 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink [&_p]:mt-3">
    <h1 className="font-display text-5xl font-bold text-ink">Gizlilik ve Çerez Politikası</h1>
    <p>Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında {site.name} (“İşletme”) tarafından ziyaretçilerimizi bilgilendirmek amacıyla hazırlanmıştır.</p>
    <h2>Veri sorumlusu</h2>
    <p>{site.name}{site.master && ` — ${site.master}`}. Adres: <Fill value={site.address} label="Adres" />. Telefon: {site.phone}{site.email && `, e-posta: ${site.email}`}.</p>
    <h2>Toplanan veriler</h2>
    <p>Sitemizde üyelik veya form kaydı tutulmaz. Teklif formu ve WhatsApp butonları, yazdığınız bilgileri yalnızca sizin cihazınızda WhatsApp mesajına dönüştürür; bu bilgiler sitemizin sunucusuna gönderilmez. WhatsApp veya telefon ile bize ilettiğiniz ad, telefon, adres ve iş bilgileri yalnızca talebinize dönüş yapmak, keşif ve hizmet sunmak amacıyla kullanılır.</p>
    <h2>Çerezler ve ziyaret istatistikleri</h2>
    <p>Onay vermeniz halinde, sitenin nasıl kullanıldığını anlamak için Google Analytics çerezleri kullanılır (IP adresi anonimleştirilir, reklam amaçlı kullanılmaz). Onay vermezseniz bu çerezler yüklenmez. Tercihinizi tarayıcınızdaki site verilerini silerek değiştirebilirsiniz.</p>
    <h2>Haklarınız</h2>
    <p>KVKK’nın 11. maddesi uyarınca kişisel verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini isteme gibi haklara sahipsiniz. Talepleriniz için yukarıdaki iletişim bilgilerinden bize ulaşabilirsiniz.</p>
    <p className="text-sm text-slate-500">Son güncelleme: Kasım 2026</p>
  </main>);
}
