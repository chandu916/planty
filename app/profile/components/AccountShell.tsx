"use client";

import { motion } from "framer-motion";
import { Heart, Package2, TicketPercent, User2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import BackButton from "@/app/components/BackButton";

const ACCOUNT_LINKS = [
  {
    href: "/profile",
    label: "My Profile",
    description: "Address, password and account details",
    icon: User2,
  },
  {
    href: "/profile/orders",
    label: "Orders",
    description: "Track deliveries and payment status",
    icon: Package2,
  },
  {
    href: "/profile/coupons",
    label: "Coupons",
    description: "Unlock current savings and rewards",
    icon: TicketPercent,
  },
  {
    href: "/profile/wishlist",
    label: "Wishlist",
    description: "Keep your favorite plants close",
    icon: Heart,
  },
];

export default function AccountShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <main className="flex min-h-screen flex-col bg-transparent">
      <Navbar />

      <div className="flex-1 px-4 pb-16 pt-28 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <BackButton fallbackHref="/" label="Back" className="mb-5" />

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.045] px-6 py-7 shadow-[0_24px_100px_rgba(0,0,0,0.28)] backdrop-blur-sm"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(74,222,128,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(125,211,252,0.12),transparent_34%)]" />
            <div className="relative z-10 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-green-300/60">Account Space</p>
                <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-green-100/60 sm:text-base">{description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href;

                  return (
                    <Link key={href} href={href}>
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
                          active
                            ? "border-green-400/40 bg-green-500/20 text-green-100"
                            : "border-white/10 bg-white/5 text-green-100/60 hover:border-green-400/25 hover:text-white"
                        }`}
                      >
                        <Icon size={14} />
                        {label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.section>

          <div className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="h-fit rounded-[28px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm lg:sticky lg:top-28">
              <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-[0.26em] text-green-300/45">Navigate</p>
              <div className="space-y-2">
                {ACCOUNT_LINKS.map(({ href, label, description: linkDescription, icon: Icon }) => {
                  const active = pathname === href;

                  return (
                    <Link key={href} href={href}>
                      <span
                        className={`flex items-start gap-3 rounded-2xl border px-4 py-3 transition-all ${
                          active
                            ? "border-green-400/30 bg-green-500/14"
                            : "border-white/8 bg-white/[0.03] hover:border-green-400/20 hover:bg-green-500/[0.06]"
                        }`}
                      >
                        <span className={`mt-0.5 ${active ? "text-green-300" : "text-green-300/60"}`}>
                          <Icon size={16} />
                        </span>
                        <span>
                          <span className={`block text-sm font-semibold ${active ? "text-white" : "text-green-100/80"}`}>{label}</span>
                          <span className="mt-1 block text-xs leading-5 text-green-100/45">{linkDescription}</span>
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </aside>

            <section>{children}</section>
          </div>
        </div>
      </div>

      <Footer minimal />
    </main>
  );
}