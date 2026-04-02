import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import RegisterForm from "@/app/components/RegisterForm";
import BackButton from "@/app/components/BackButton";

export const metadata = { title: "Register — Planty" };

export default function RegisterPage() {
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
