"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Copy, Sparkles, TicketPercent, TimerReset } from "lucide-react";
import { useEffect, useState } from "react";
import { useUserStore } from "@/lib/userStore";
import AccountShell from "@/app/profile/components/AccountShell";

type ProfileInitialUser = {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

const COUPONS = [
  {
    code: "WELCOME10",
    title: "First Green Order",
    value: "10% off",
    minimum: "Min order ₹799",
    detail: "Perfect for first-time buyers building their indoor corner.",
    accent: "from-emerald-500/20 to-green-400/5",
  },
  {
    code: "FREESHIP",
    title: "Delivery On Us",
    value: "Free delivery",
    minimum: "Min order ₹999",
    detail: "Best for mixed carts with multiple medium-sized plants.",
    accent: "from-sky-500/20 to-cyan-400/5",
  },
  {
    code: "PLANTLOVER15",
    title: "Weekend Bloom Drop",
    value: "15% off",
    minimum: "Selected flowering plants",
    detail: "A rotating promo for premium blooms and gifting picks.",
    accent: "from-amber-500/20 to-yellow-400/5",
  },
];

export default function CouponsPageClient({ initialUser }: { initialUser: ProfileInitialUser }) {
  const login = useUserStore((state) => state.login);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    login(initialUser);
  }, [initialUser, login]);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode((current) => (current === code ? null : current)), 1500);
    } catch {
      setCopiedCode(null);
    }
  };

  return (
    <AccountShell
      title="Coupons"
      description="Keep your active discount codes in one place and quickly copy the best offer before checkout."
    >
      <div className="space-y-6">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full border border-amber-400/20 bg-amber-500/10 p-3 text-amber-300">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Today&apos;s best savings</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-green-100/50">
                Planty seasonal offers rotate across indoor greens, gifting bundles, and premium bonsai collections.
                Copy a code here, then apply it during your next checkout flow.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {COUPONS.map((coupon) => {
            const copied = copiedCode === coupon.code;

            return (
              <motion.div
                key={coupon.code}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className={`overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br ${coupon.accent} p-[1px]`}
              >
                <div className="h-full rounded-[27px] bg-[#06100c]/92 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-green-100/45">
                      <TicketPercent size={13} />
                      Offer
                    </div>
                    <div className="inline-flex items-center gap-1 text-xs text-green-100/35">
                      <TimerReset size={13} />
                      Limited drop
                    </div>
                  </div>

                  <p className="mt-5 text-xs uppercase tracking-[0.22em] text-green-100/35">{coupon.code}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{coupon.title}</h3>
                  <p className="mt-2 text-3xl font-bold text-green-300">{coupon.value}</p>
                  <p className="mt-3 text-sm text-green-100/55">{coupon.minimum}</p>
                  <p className="mt-3 text-sm leading-6 text-green-100/45">{coupon.detail}</p>

                  <button
                    type="button"
                    onClick={() => void handleCopy(coupon.code)}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white transition hover:border-green-400/30 hover:text-green-200"
                  >
                    {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                    {copied ? "Copied" : "Copy Code"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AccountShell>
  );
}