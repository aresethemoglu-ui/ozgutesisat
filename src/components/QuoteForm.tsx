"use client";
import {useState} from "react";import {services} from "@/lib/services";import {waHref} from "@/config/site";import {useSite} from "./SiteProvider";
export default function QuoteForm(){const site=useSite();const wa=(m:string)=>waHref(site,m);const [svc,setS]=useState(services[0].title);const [d,setD]=useState(site.district);const [t,setT]=useState("");
const msg=[`Merhaba ${site.shortName||site.name},`,"",`${svc} konusunda teklif almak istiyorum.`,"",`• İlçe / mahalle: ${d}`,`• Yapılacak iş: ${t}`,"","(Varsa fotoğraf / video da gönderebilirim.)"].join("\n");
const f="w-full rounded-md border border-slate-300 bg-white p-3 text-ink";
return(<div className="grid gap-3"><label className="grid gap-1">Hizmet türü<select className={f} value={svc} onChange={e=>setS(e.target.value)}>{services.map(s=><option key={s.slug}>{s.title}</option>)}</select></label>
<label className="grid gap-1">İlçe<input className={f} value={d} onChange={e=>setD(e.target.value)} placeholder="İlçenizi yazın"/></label>
<label className="grid gap-1">İş açıklaması<textarea className={f} rows={3} value={t} onChange={e=>setT(e.target.value)} placeholder="Yapılacak işi veya arızayı kısaca anlatın"/></label>
<a href={wa(msg)} className="rounded-md bg-accent py-3 text-center font-bold text-white">WhatsApp’tan Teklif Al</a></div>);}
