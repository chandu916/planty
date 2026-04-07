import type { Metadata } from "next";
import Link from "next/link";
import { Cormorant_Garamond, Great_Vibes } from "next/font/google";
import { ArrowRight, Leaf } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const signature = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "About Planty",
  description: "Learn about Planty, our care-first plant curation style, and the story behind the brand.",
};

export default function AboutPage() {
  return (
    <main className="relative flex min-h-screen flex-col bg-transparent">
      <Navbar />

      <section className="px-4 pb-16 pt-30 sm:px-6 sm:pt-32">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative">
            <div className="pointer-events-none absolute inset-x-[-8%] inset-y-[-10%] rounded-[56px] blur-3xl opacity-100" style={{ backgroundImage: "radial-gradient(720px 380px at 18% 20%, rgba(78, 240, 162, 0.14), transparent 72%), radial-gradient(740px 380px at 82% 24%, rgba(239, 68, 68, 0.10), transparent 76%)" }} />

            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/70">
                <Leaf size={14} className="text-emerald-300" />
                About Planty
              </span>

              <h1 className={`${serif.className} mt-6 text-5xl font-semibold leading-[0.92] text-white sm:text-6xl lg:text-7xl`}>
                A quieter, greener way to bring living beauty home.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-emerald-50/72 sm:text-lg">
                Planty was shaped around a simple idea: plants should feel personal, calming, and beautifully chosen. We focus on collections that look refined, travel well, and make caring for greenery feel natural for both beginners and long-time plant lovers.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-emerald-50/75">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">Care-first curation</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">Indoor and outdoor favorites</span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">Honest growing guidance</span>
              </div>

              <Link
                href="/#plants"
                className="mt-9 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
              >
                Explore the collection
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[31rem]">
            <div className="relative mx-auto aspect-[0.88] w-full max-w-[28rem] -rotate-[8deg]">
              <div className="absolute inset-0 rounded-[58%_42%_62%_38%/48%_66%_34%_52%] border border-emerald-200/15 bg-[radial-gradient(circle_at_28%_20%,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_72%_16%,rgba(74,222,128,0.16),transparent_30%),linear-gradient(155deg,rgba(9,38,22,0.96),rgba(7,20,12,0.92))] shadow-[0_28px_90px_rgba(0,0,0,0.42)]" />
              <div className="absolute inset-[4%] rounded-[58%_42%_62%_38%/48%_66%_34%_52%] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] backdrop-blur-xl" />
              <div className="pointer-events-none absolute bottom-[14%] left-1/2 h-[46%] w-px -translate-x-1/2 rotate-[18deg] bg-gradient-to-b from-white/0 via-emerald-200/45 to-emerald-500/10" />
              <div className="pointer-events-none absolute left-[36%] top-[28%] h-[18%] w-px rotate-[54deg] bg-gradient-to-b from-white/0 via-emerald-100/30 to-white/0" />
              <div className="pointer-events-none absolute right-[33%] top-[30%] h-[16%] w-px -rotate-[56deg] bg-gradient-to-b from-white/0 via-emerald-100/26 to-white/0" />

              <div className={`${serif.className} absolute inset-[11%] flex rotate-[8deg] flex-col justify-center rounded-[48%_52%_44%_56%/38%_62%_38%_62%] px-9 py-10 text-emerald-50/86`}>
                <span className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100/42">
                  Our Bio
                </span>
                <p className="text-[1.05rem] leading-8 sm:text-[1.16rem]">
                  Planty is a small, design-minded plant space created for people who want more than a catalogue. We care about calm rooms, healthy leaves, and meaningful plant choices that make a home feel alive.
                </p>
                <p className="mt-5 text-[0.98rem] leading-7 text-emerald-50/68 sm:text-[1.05rem]">
                  From bonsai and herbs to flowering accents and indoor greens, every collection is selected to feel fresh, rooted, and easy to love for the long term.
                </p>
              </div>
            </div>

            <div className="mt-6 text-center lg:pr-4 lg:text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-200/45">Owner Signature</p>
              <p className={`${signature.className} mt-2 text-5xl leading-none text-red-400 drop-shadow-[0_10px_26px_rgba(239,68,68,0.3)] sm:text-6xl`}>
                Chandu
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer minimal />
    </main>
  );
}