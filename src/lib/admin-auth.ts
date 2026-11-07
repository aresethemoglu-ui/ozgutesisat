import crypto from "node:crypto";
import { cookies } from "next/headers";

// Kullanıcı adı ve şifre .env.local dosyasındaki ADMIN_USERNAME ve ADMIN_PASSWORD değerleridir.
export const COOKIE = "ozgu_admin";
const pw = () => process.env.ADMIN_PASSWORD || "";
const user = () => process.env.ADMIN_USERNAME || "";
const token = () => crypto.createHmac("sha256", pw()).update(`ozgu-admin-v1:${user()}`).digest("hex");
const same = (a: string, b: string) => {
  const x = crypto.createHash("sha256").update(a).digest(), y = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(x, y);
};

// Kullanıcı adı büyük/küçük harf duyarsız, şifre duyarlı. İkisi de her zaman kontrol edilir.
export const credentialsOk = (u: string, p: string) => {
  const okU = same(u.trim().toLocaleLowerCase("tr"), user().toLocaleLowerCase("tr")), okP = same(p, pw());
  return !!pw() && !!user() && okU && okP;
};
export const sessionToken = token;
export const adminConfigured = () => !!pw() && !!user();

export async function isAdmin() {
  if (!pw()) return false;
  const c = (await cookies()).get(COOKIE)?.value;
  return !!c && same(c, token());
}
