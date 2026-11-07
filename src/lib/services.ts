export type Service = {
  slug: string; title: string; group: "elektrik" | "su"; icon: string;
  intro: string; items: string[]; msg: string; note?: string;
};
export const groups = {
  elektrik: { title: "Elektrik Tesisatı", icon: "Zap", text: "Yeni kurulumdan arıza tespitine, pano işlerinden aydınlatmaya kadar ev ve iş yeri elektrik işleri." },
  su: { title: "Su Tesisatı", icon: "Droplets", text: "Sıfırdan tesisat, su kaçağı tespiti, banyo-mutfak tesisatı ve gider işleri." },
} as const;

export const services: Service[] = [
 {slug:"elektrik-tesisati",group:"elektrik",title:"Elektrik Tesisatı Kurulumu",icon:"Zap",intro:"Yeni yapı ve tadilatlarda baştan sona elektrik tesisatı kurulumu.",items:["Sıfırdan elektrik tesisatı","Kablo çekimi ve hat döşeme","Priz ve anahtar montajı","Topraklama hattı","İş yeri ve dükkân tesisatı"],msg:"elektrik tesisatı kurulumu yaptırmak istiyorum"},
 {slug:"elektrik-ariza",group:"elektrik",title:"Elektrik Arıza ve Onarım",icon:"PlugZap",intro:"Sigorta atması, kısa devre, çalışmayan priz ve hatlarda arıza tespiti ve onarım.",items:["Arıza tespiti","Kısa devre ve kaçak sorunları","Sigorta atması sorunları","Isınan priz ve kablolar","Hat onarımı"],msg:"elektrik arızası için destek almak istiyorum"},
 {slug:"pano-aydinlatma",group:"elektrik",title:"Pano ve Aydınlatma",icon:"Lightbulb",intro:"Sigorta panosu yenileme, kaçak akım rölesi ve iç/dış aydınlatma kurulumu.",items:["Sigorta panosu montajı ve yenileme","Kaçak akım rölesi","Avize, spot ve LED aydınlatma","Dış cephe ve bahçe aydınlatması","Eski hatların yenilenmesi"],msg:"pano / aydınlatma işi yaptırmak istiyorum"},
 {slug:"su-tesisati",group:"su",title:"Su Tesisatı Kurulumu",icon:"Droplets",intro:"Yeni yapı ve tadilatlarda temiz su ve pis su tesisatı kurulumu.",items:["Sıfırdan su tesisatı","Temiz su ve pis su hatları","Boru değişimi","Sayaç sonrası hat yenileme","Hidrofor ve depo bağlantıları"],msg:"su tesisatı kurulumu yaptırmak istiyorum"},
 {slug:"su-kacagi",group:"su",title:"Su Kaçağı ve Arıza",icon:"Search",intro:"Duvar ve zemindeki su kaçaklarının tespiti, boru patlağı ve arıza onarımı.",items:["Su kaçağı tespiti","Boru patlağı onarımı","Nem ve rutubet kaynaklı kaçaklar","Sayaç dönmesi sorunları","Acil su arızaları"],msg:"su kaçağı için destek almak istiyorum"},
 {slug:"banyo-mutfak",group:"su",title:"Banyo, Mutfak ve Gider",icon:"ShowerHead",intro:"Batarya, lavabo, klozet, rezervuar montajı ve tıkanıklık / gider sorunları.",items:["Musluk ve batarya değişimi","Lavabo, klozet, rezervuar montajı","Duş ve banyo tesisatı","Gider ve tıkanıklık sorunları","Çamaşır / bulaşık makinesi bağlantısı"],msg:"banyo / mutfak tesisatı işi yaptırmak istiyorum"},
];
