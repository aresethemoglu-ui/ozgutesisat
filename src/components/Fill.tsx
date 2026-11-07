import { isDev } from "@/config/site";
// Değer boşsa: yerelde turuncu "doldurulacak" kutusu, canlı sitede hiçbir şey göstermez.
export default function Fill({ value, label, children }: { value?: string | number | null; label: string; children?: React.ReactNode }) {
  if (value) return <>{children ?? value}</>;
  if (!isDev) return null;
  return <span className="inline-block rounded border border-dashed border-accent bg-accent/10 px-2 py-0.5 text-sm font-semibold text-accent">✎ {label} — <code>/admin</code></span>;
}
