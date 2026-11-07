import type {MetadataRoute} from "next";import {services} from "@/lib/services";import {getSite} from "@/lib/site-server";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const {url}=await getSite();const now=new Date();
return[{url,lastModified:now,priority:1},{url:`${url}/calismalarimiz`,lastModified:now,priority:.8},{url:`${url}/iletisim`,priority:.7},...services.map(s=>({url:`${url}/hizmetler/${s.slug}`,priority:.8})),{url:`${url}/gizlilik`,priority:.2}];}
