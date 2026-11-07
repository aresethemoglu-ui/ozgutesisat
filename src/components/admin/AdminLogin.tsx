"use client";
import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

// Hem /admin sayfasında hem de ana sayfadaki "Yönetici Girişi" penceresinde kullanılır.
export default function AdminLogin({ onSuccess }: { onSuccess?: () => void }) {
  const [user, setUser] = useState(""), [pw, setPw] = useState(""), [show, setShow] = useState(false);
  const [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ username: user, password: pw }) });
    if (r.ok) { onSuccess ? onSuccess() : location.reload(); return; }
    setErr((await r.json().catch(() => ({}))).error || "Giriş başarısız."); setBusy(false);
  }
  const f = "rounded-md border border-slate-300 p-3 font-normal text-ink";
  return (<form onSubmit={submit} className="rounded-xl bg-white p-6 text-ink shadow-sm">
    <span className="grid h-12 w-12 place-items-center rounded-full bg-navy text-white"><Lock size={22} /></span>
    <h1 className="mt-4 font-display text-3xl font-bold">Yönetici Girişi</h1>
    <p className="mt-1 text-sm text-slate-600">Çalışma fotoğrafları, videolar ve işletme bilgileri.</p>
    <label className="mt-6 grid gap-1 font-semibold">Kullanıcı adı
      <input autoFocus autoComplete="username" autoCapitalize="none" spellCheck={false} value={user} onChange={(e) => setUser(e.target.value)} className={f} /></label>
    <label className="mt-4 grid gap-1 font-semibold">Şifre
      <span className="relative"><input type={show ? "text" : "password"} autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} className={`${f} w-full pr-11`} />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Şifreyi gizle" : "Şifreyi göster"} className="absolute inset-y-0 right-0 px-3 text-slate-500">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
    {err && <p role="alert" className="mt-3 text-sm font-semibold text-red-600">{err}</p>}
    <button disabled={busy || !pw || !user} className="mt-5 w-full rounded-md bg-accent py-3 font-bold text-white disabled:opacity-50">{busy ? "Kontrol ediliyor…" : "Giriş yap"}</button>
  </form>);
}
