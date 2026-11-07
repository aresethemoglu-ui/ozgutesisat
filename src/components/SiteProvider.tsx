"use client";
import { createContext, useContext } from "react";
import { defaultSite, type SiteInfo } from "@/config/site";

const Ctx = createContext<SiteInfo>(defaultSite);
export const SiteProvider = ({ site, children }: { site: SiteInfo; children: React.ReactNode }) => <Ctx.Provider value={site}>{children}</Ctx.Provider>;
export const useSite = () => useContext(Ctx);
