# Özgü Elektrik ve Su Tesisatı — Web Sitesi (Next.js + Tailwind)

## Yerelde çalıştırma
```
npm install
npm run dev     # http://localhost:3000
npm run build   # kontrol için tam derleme
```
Yerelde (`npm run dev`) doldurulmamış alanların yerinde turuncu kesikli "✎ … — /admin" kutuları görünür.
Bu kutular canlı sitede (build) GÖSTERİLMEZ; boş alanlar tamamen gizlenir.

## Yönetim paneli — http://localhost:3000/admin
- Giriş: sitenin en altındaki **Yönetici Girişi** butonu (veya doğrudan /admin).
- Kullanıcı adı ve şifre: proje klasöründeki `.env.local` dosyasında (`ADMIN_USERNAME=`, `ADMIN_PASSWORD=`). Değiştirince sunucuyu yeniden başlatın.
- **Fotoğraf & Video:** sürükle-bırak ile yükleme, başlık/konum/tarih/kategori düzenleme, silme, YouTube bağlantısı ekleme.
- **İşletme Bilgileri:** usta adı, hakkımızda, telefon, adres, saatler, bölgeler, sosyal medya, Google alanları (`data/site.json`'a yazılır).
- Panel hem yerelde hem canlı sitede çalışır. Yerelde dosyalar `public/galeri` ve `data/` klasörlerine, canlıda Netlify Blobs'a kaydedilir.
- Fotoğraflar yüklenmeden önce tarayıcıda 1920 px'e küçültülür. Videolar 3 MB'lık parçalar hâlinde yüklenir ve otomatik kapak resmi oluşturulur.

## WhatsApp konu seçenekleri
Genel WhatsApp butonları önce konu seçme penceresi açar. Konular ve mesaj metinleri: `src/lib/whatsapp.ts`.

## Nereyi düzenlemeli?
| Ne | Dosya |
|---|---|
| İşletme bilgileri | `/admin` → İşletme Bilgileri (veya `data/site.json`) |
| Google alanları | `/admin` → İşletme Bilgileri → Google |
| Hizmetler | `src/lib/services.ts` |
| Fotoğraf / video | `public/galeri/elektrik/` ve `public/galeri/su/` klasörleri |
| Fotoğraf başlıkları, YouTube videoları | `/admin` → Fotoğraf & Video |
| Müşteri yorumları (yalnızca gerçek) | `src/content/yorumlar.ts` |

## Fotoğraf ve video ekleme
1. Dosyayı `public/galeri/elektrik/` veya `public/galeri/su/` içine kopyalayın (jpg, png, webp / mp4, webm, mov).
En kolayı `/admin` panelidir. Alternatif olarak dosyayı doğrudan klasöre de atabilirsiniz:
2. Dosya adı başlık olur: `pano-yenileme-haliliye.jpg` → "Pano yenileme haliliye".
3. Videoya kapak: videoyla aynı adla bir `.jpg` koyun.
4. Büyük videoları YouTube'a yükleyip panelden bağlantısını ekleyin.

## Yayına alma (Netlify + ozgutesisat.com)
1. Netlify'da site oluşturulur ve proje yayınlanır (`netlify deploy --build --prod`). Derleme sırasında `NETLIFY=true` olduğundan canlı site otomatik olarak Netlify Blobs kullanır.
2. Netlify → Site configuration → Environment variables bölümüne `ADMIN_USERNAME` ve `ADMIN_PASSWORD` eklenir (canlı için ayrı, güçlü bir şifre).
3. Yereldeki içerik bir kez canlıya aktarılır:
   `NETLIFY_SITE_ID=... NETLIFY_AUTH_TOKEN=... node scripts/canliya-aktar.mjs`
4. Alan adı: Netlify → Domain management → `ozgutesisat.com` eklenir. Cloudflare DNS'e `A @ 75.2.60.5` ve `CNAME www <site>.netlify.app` kayıtları **DNS only** (gri bulut) olarak girilir.
5. Google: Search Console (DNS TXT ile alan adı doğrulama), Google İşletme Profili, Analytics (GA4). Kimlikler /admin → İşletme Bilgileri → Google bölümüne yazılır.

## Not
Masaüstü iCloud ile senkronize ediliyor. Bağımlılıklar bu yüzden `node_modules.nosync` klasöründe duruyor (`node_modules` ona bağlantıdır; iCloud `.nosync` ile biten klasörleri buluta taşımaz).
`npm install` bu bağlantıyı silip normal bir klasör kurarsa: `mv node_modules node_modules.nosync && ln -s node_modules.nosync node_modules`. `node_modules` buluta taşınırsa derleme takılır;

