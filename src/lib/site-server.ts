import { cache } from "react";
import { mergeSite, type SiteInfo } from "@/config/site";
import { readJSON } from "@/lib/store";

export const getSite = cache(async () => mergeSite(await readJSON<Partial<SiteInfo> | null>("site.json", null)));
