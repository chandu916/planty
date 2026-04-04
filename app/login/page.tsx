import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminSessionFromCookieStore, getUserSessionFromCookieStore } from "@/server/auth/guards";
import LoginPageClient from "./LoginPageClient";

export const metadata = { title: "Login — Planty" };

export default async function LoginPage() {
  const cookieStore = await cookies();
  const admin = await getAdminSessionFromCookieStore(cookieStore);
  if (admin) {
    redirect("/admin");
  }

  const user = await getUserSessionFromCookieStore(cookieStore);
  if (user) {
    redirect("/profile");
  }

  return <LoginPageClient />;
}
