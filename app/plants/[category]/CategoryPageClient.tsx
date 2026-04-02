"use client";

import { motion } from "framer-motion";
import { Star, Leaf } from "lucide-react";
import PlantCard from "@/app/components/PlantCard";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import BackButton from "@/app/components/BackButton";
import type { PlantCategory } from "@/lib/plants";

const CATEGORY_THEMES: Record<
  string,
  {
    pageBackground: string;
    topGlow: string;
    bottomGlow: string;
    grainTint: string;
    accentText: string;
    accentSoftText: string;
    statGlow: string;
  }
> = {
  bonsai: {
    pageBackground:
      "radial-gradient(900px 520px at 10% 12%, rgba(244, 196, 48, 0.16), transparent 58%), radial-gradient(780px 500px at 84% 18%, rgba(49, 153, 117, 0.22), transparent 56%), radial-gradient(860px 620px at 48% 88%, rgba(24, 83, 65, 0.30), transparent 60%), linear-gradient(160deg, #0c1712 0%, #10251c 34%, #153027 66%, #1e392d 100%)",
    topGlow: "radial-gradient(ellipse at top, rgba(252, 211, 77, 0.16) 0%, transparent 62%)",
    bottomGlow: "radial-gradient(ellipse at bottom, rgba(34, 197, 94, 0.14) 0%, transparent 66%)",
    grainTint: "rgba(242, 227, 182, 0.08)",
    accentText: "text-amber-200",
    accentSoftText: "text-emerald-200/70",
    statGlow: "shadow-[0_0_36px_rgba(251,191,36,0.16)]",
  },
  flowering: {
    pageBackground:
      "radial-gradient(900px 520px at 14% 10%, rgba(255, 155, 194, 0.22), transparent 58%), radial-gradient(760px 520px at 88% 16%, rgba(236, 72, 153, 0.22), transparent 56%), radial-gradient(860px 680px at 52% 90%, rgba(111, 33, 87, 0.30), transparent 62%), linear-gradient(160deg, #190916 0%, #2a0d24 34%, #401236 66%, #58164a 100%)",
    topGlow: "radial-gradient(ellipse at top, rgba(255, 190, 214, 0.16) 0%, transparent 62%)",
    bottomGlow: "radial-gradient(ellipse at bottom, rgba(244, 114, 182, 0.14) 0%, transparent 66%)",
    grainTint: "rgba(255, 214, 231, 0.08)",
    accentText: "text-pink-100",
    accentSoftText: "text-rose-100/70",
    statGlow: "shadow-[0_0_36px_rgba(236,72,153,0.18)]",
  },
  water: {
    pageBackground:
      "radial-gradient(900px 520px at 10% 12%, rgba(125, 211, 252, 0.24), transparent 58%), radial-gradient(820px 540px at 88% 18%, rgba(45, 212, 191, 0.20), transparent 56%), radial-gradient(920px 700px at 48% 88%, rgba(21, 94, 117, 0.34), transparent 60%), linear-gradient(160deg, #04131d 0%, #082432 34%, #0b3140 66%, #11445a 100%)",
    topGlow: "radial-gradient(ellipse at top, rgba(186, 230, 253, 0.18) 0%, transparent 62%)",
    bottomGlow: "radial-gradient(ellipse at bottom, rgba(94, 234, 212, 0.14) 0%, transparent 66%)",
    grainTint: "rgba(214, 241, 255, 0.08)",
    accentText: "text-cyan-100",
    accentSoftText: "text-teal-100/70",
    statGlow: "shadow-[0_0_36px_rgba(34,211,238,0.18)]",
  },
  succulents: {
    pageBackground:
      "radial-gradient(900px 520px at 10% 10%, rgba(190, 242, 100, 0.20), transparent 56%), radial-gradient(820px 520px at 90% 20%, rgba(74, 222, 128, 0.20), transparent 56%), radial-gradient(840px 640px at 48% 88%, rgba(50, 91, 41, 0.32), transparent 60%), linear-gradient(160deg, #0d180b 0%, #152611 34%, #223616 66%, #31461f 100%)",
    topGlow: "radial-gradient(ellipse at top, rgba(236, 252, 203, 0.16) 0%, transparent 62%)",
    bottomGlow: "radial-gradient(ellipse at bottom, rgba(163, 230, 53, 0.14) 0%, transparent 66%)",
    grainTint: "rgba(238, 255, 214, 0.08)",
    accentText: "text-lime-100",
    accentSoftText: "text-emerald-100/70",
    statGlow: "shadow-[0_0_36px_rgba(132,204,22,0.18)]",
  },
  indoor: {
    pageBackground:
      "radial-gradient(900px 520px at 12% 12%, rgba(110, 231, 183, 0.18), transparent 58%), radial-gradient(820px 520px at 88% 18%, rgba(34, 197, 94, 0.18), transparent 56%), radial-gradient(900px 680px at 50% 88%, rgba(14, 69, 55, 0.32), transparent 60%), linear-gradient(160deg, #061510 0%, #0b221a 34%, #123026 66%, #1a4032 100%)",
    topGlow: "radial-gradient(ellipse at top, rgba(220, 252, 231, 0.16) 0%, transparent 62%)",
    bottomGlow: "radial-gradient(ellipse at bottom, rgba(74, 222, 128, 0.14) 0%, transparent 66%)",
    grainTint: "rgba(221, 255, 234, 0.08)",
    accentText: "text-emerald-100",
    accentSoftText: "text-green-100/70",
    statGlow: "shadow-[0_0_36px_rgba(16,185,129,0.18)]",
  },
  herbs: {
    pageBackground:
      "radial-gradient(900px 520px at 10% 10%, rgba(253, 224, 71, 0.18), transparent 58%), radial-gradient(820px 520px at 90% 18%, rgba(163, 230, 53, 0.18), transparent 56%), radial-gradient(900px 680px at 50% 88%, rgba(74, 95, 28, 0.32), transparent 60%), linear-gradient(160deg, #171407 0%, #24210a 34%, #32320f 66%, #414416 100%)",
    topGlow: "radial-gradient(ellipse at top, rgba(254, 249, 195, 0.16) 0%, transparent 62%)",
    bottomGlow: "radial-gradient(ellipse at bottom, rgba(190, 242, 100, 0.14) 0%, transparent 66%)",
    grainTint: "rgba(252, 251, 217, 0.08)",
    accentText: "text-yellow-100",
    accentSoftText: "text-lime-100/70",
    statGlow: "shadow-[0_0_36px_rgba(234,179,8,0.18)]",
  },
};

export default function CategoryPageClient({
  category,
}: {
  category: PlantCategory;
}) {
  const theme = CATEGORY_THEMES[category.id] ?? CATEGORY_THEMES.indoor;

  return (
    <main className="relative flex flex-col min-h-screen overflow-hidden bg-transparent">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0" style={{ background: theme.pageBackground }} />
        <div className="absolute inset-0 opacity-90" style={{ backgroundImage: theme.topGlow }} />
        <div className="absolute inset-0 opacity-80" style={{ backgroundImage: theme.bottomGlow }} />
        <div
          className="absolute inset-0 opacity-[0.13] mix-blend-screen"
          style={{
            backgroundImage: `radial-gradient(${theme.grainTint} 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />
        <div className="absolute left-[-8%] top-[12%] h-72 w-72 rounded-full blur-3xl" style={{ background: theme.grainTint }} />
        <div className="absolute right-[-10%] top-[24%] h-96 w-96 rounded-full blur-3xl" style={{ background: theme.grainTint }} />
      </div>

      <Navbar />

      {/* Hero Banner */}
      <section className={`relative pt-32 pb-16 px-6 overflow-hidden`}>
        <div
          className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-30`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/45" />
        <div className="absolute inset-0" style={{ backgroundImage: theme.topGlow }} />

        {/* Floating emojis */}
        {[...Array(8)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-4xl select-none pointer-events-none"
            style={{
              left: `${10 + i * 11}%`,
              top: `${20 + (i % 3) * 20}%`,
              opacity: 0.12,
            }}
            animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          >
            {category.emoji}
          </motion.span>
        ))}

        <div className="relative z-10 max-w-6xl mx-auto">
          <BackButton fallbackHref="/#plants" label="Back" className="mb-6" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 mb-3"
          >
            <span className="text-6xl">{category.emoji}</span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className="text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-4xl sm:text-6xl font-extrabold text-white mb-4 ${theme.statGlow}`}
          >
            {category.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`max-w-2xl text-lg leading-relaxed ${theme.accentSoftText}`}
          >
            {category.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`mt-4 flex items-center gap-2 text-sm ${theme.accentText}`}
          >
            <Leaf size={14} />
            {category.plants.length} plants available
          </motion.div>
        </div>
      </section>

      {/* Plants Grid */}
      <section className="relative py-16 px-6 flex-1">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/8 to-black/20" />
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {category.plants.map((plant, i) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                categoryName={category.name}
                categoryEmoji={category.emoji}
                delay={i * 0.08}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
