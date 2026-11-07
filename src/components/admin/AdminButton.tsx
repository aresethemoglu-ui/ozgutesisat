"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, X } from "lucide-react";
import AdminLogin from "./AdminLogin";

// Ana sayfadaki "Yönetici Girişi" butonu: giriş yapılmışsa panele gider, değilse giriş penceresi açar.
export default function AdminButton({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false), [checking, setChecking] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open]);

  async function click() {
    setChecking(true);
    const d = await fetch("/api/admin/login", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ admin: false }));
    setChecking(false);
    if (d.admin) router.push("/admin"); else setOpen(true);
  }

  return (<>
    <button onClick={click} disabled={checking} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-white/20 hover:bg-white/10 ${className}`}><Lock size={15} />Yönetici Girişi</button>
    {open && <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4" onClick={() => setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label="Yönetici girişi" className="wa-pop relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <button aria-label="Kapat" onClick={() => setOpen(false)} style={{ position: "absolute", top: 12, right: 12, left: "auto" }} className="z-10 rounded-full p-2 text-slate-500 hover:bg-mist"><X size={20} /></button>
        <AdminLogin onSuccess={() => { setOpen(false); router.push("/admin"); router.refresh(); }} />
      </div></div>}
  </>);
}
