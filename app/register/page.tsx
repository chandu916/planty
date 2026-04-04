import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import RegisterForm from "@/app/components/RegisterForm";
import BackButton from "@/app/components/BackButton";
import { getAdminSessionFromCookieStore, getUserSessionFromCookieStore } from "@/server/auth/guards";

export const metadata = { title: "Register — Planty" };

export default async function RegisterPage() {
  const cookieStore = await cookies();
  const admin = await getAdminSessionFromCookieStore(cookieStore);
  if (admin) {
    redirect("/admin");
  }

  const user = await getUserSessionFromCookieStore(cookieStore);
  if (user) {
    redirect("/profile");
  }

  return (
    <main className="flex flex-col min-h-screen bg-transparent">
      <Navbar />
      <div className="pt-24 px-6 max-w-2xl mx-auto w-full">
        <BackButton fallbackHref="/" label="Back" />
      </div>
      <div>
        <RegisterForm />
      </div>
      <Footer minimal />
    </main>
  );
}
