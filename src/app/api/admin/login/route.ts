import { NextResponse } from "next/server";
import { COOKIE, credentialsOk, sessionToken, adminConfigured, isAdmin } from "@/lib/admin-auth";

let fails = 0, lockUntil = 0;
export async function POST(req: Request) {
  if (!adminConfigured()) return NextResponse.json({ error: "Admin şifresi tanımlı değil (.env.local → ADMIN_USERNAME / ADMIN_PASSWORD)." }, { status: 500 });
  if (Date.now() < lockUntil) return NextResponse.json({ error: "Çok fazla hatalı deneme. 1 dakika sonra tekrar deneyin." }, { status: 429 });
  const { username, password } = await req.json().catch(() => ({}));
  if (!credentialsOk(String(username ?? ""), String(password ?? ""))) {
    if (++fails >= 5) { lockUntil = Date.now() + 60_000; fails = 0; }
    return NextResponse.json({ error: "Kullanıcı adı veya şifre hatalı." }, { status: 401 });
  }
  fails = 0;
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, sessionToken(), { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
// Giriş durumu (ana sayfadaki buton için)
export async function GET() {
  return NextResponse.json({ admin: await isAdmin() }, { headers: { "cache-control": "no-store" } });
}
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE);
  return res;
}
