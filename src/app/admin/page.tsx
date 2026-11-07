import type { Metadata } from "next";
import { isAdmin, adminConfigured } from "@/lib/admin-auth";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminPanel from "@/components/admin/AdminPanel";

export const metadata: Metadata = { title: "Yönetim", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Admin() {
  return (<main className="min-h-[70vh] bg-mist">
    {!adminConfigured()
      ? <div className="mx-auto max-w-md px-4 py-16"><h1 className="font-display text-4xl font-bold">Yönetim</h1><p className="mt-4 rounded border border-dashed border-accent bg-accent/10 p-4 text-accent">Admin şifresi tanımlı değil. Proje klasöründeki <code>.env.local</code> dosyasına <code>ADMIN_USERNAME=...</code> ve <code>ADMIN_PASSWORD=...</code> satırlarını ekleyip sunucuyu yeniden başlatın.</p></div>
      : (await isAdmin()) ? <AdminPanel /> : <div className="mx-auto max-w-sm px-4 py-20"><AdminLogin /></div>}
  </main>);
}
