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
    accentText: string;
    softText: string;
    titleGlow: string;
    heroMist: string;
    gridMist: string;
    badgeTone: string;
    heroPanel: string;
  }
> = {
  bonsai: {
    accentText: "text-amber-100/90",
    softText: "text-emerald-50/72",
    titleGlow: "drop-shadow-[0_0_18px_rgba(252,211,77,0.14)]",
    heroMist: "radial-gradient(620px 280px at 18% 18%, rgba(251,191,36,0.18), transparent 72%), radial-gradient(700px 360px at 86% 24%, rgba(16,185,129,0.14), transparent 74%)",
    gridMist: "radial-gradient(820px 340px at 20% 0%, rgba(245,158,11,0.14), transparent 72%), radial-gradient(720px 300px at 100% 100%, rgba(16,185,129,0.10), transparent 74%)",
    badgeTone: "border-amber-200/15 bg-amber-100/[0.04]",
    heroPanel: "border-amber-200/14 bg-amber-100/[0.035]",
  },
  flowering: {
    accentText: "text-rose-100/90",
    softText: "text-white/72",
    titleGlow: "drop-shadow-[0_0_18px_rgba(244,114,182,0.16)]",
    heroMist: "radial-gradient(620px 280px at 18% 18%, rgba(244,114,182,0.18), transparent 72%), radial-gradient(700px 360px at 86% 24%, rgba(251,113,133,0.14), transparent 74%)",
    gridMist: "radial-gradient(820px 340px at 20% 0%, rgba(236,72,153,0.14), transparent 72%), radial-gradient(720px 300px at 100% 100%, rgba(251,113,133,0.10), transparent 74%)",
    badgeTone: "border-rose-200/15 bg-rose-100/[0.04]",
    heroPanel: "border-rose-200/14 bg-rose-100/[0.035]",
  },
  water: {
    accentText: "text-teal-50/90",
    softText: "text-cyan-50/72",
    titleGlow: "drop-shadow-[0_0_18px_rgba(103,232,249,0.16)]",
    heroMist: "radial-gradient(620px 280px at 18% 18%, rgba(34,211,238,0.18), transparent 72%), radial-gradient(700px 360px at 86% 24%, rgba(45,212,191,0.14), transparent 74%)",
    gridMist: "radial-gradient(820px 340px at 20% 0%, rgba(34,211,238,0.14), transparent 72%), radial-gradient(720px 300px at 100% 100%, rgba(45,212,191,0.10), transparent 74%)",
    badgeTone: "border-cyan-200/15 bg-cyan-100/[0.04]",
    heroPanel: "border-cyan-200/14 bg-cyan-100/[0.035]",
  },
  succulents: {
    accentText: "text-lime-50/90",
    softText: "text-emerald-50/72",
    titleGlow: "drop-shadow-[0_0_18px_rgba(163,230,53,0.15)]",
    heroMist: "radial-gradient(620px 280px at 18% 18%, rgba(163,230,53,0.18), transparent 72%), radial-gradient(700px 360px at 86% 24%, rgba(74,222,128,0.14), transparent 74%)",
    gridMist: "radial-gradient(820px 340px at 20% 0%, rgba(132,204,22,0.14), transparent 72%), radial-gradient(720px 300px at 100% 100%, rgba(74,222,128,0.10), transparent 74%)",
    badgeTone: "border-lime-200/15 bg-lime-100/[0.04]",
    heroPanel: "border-lime-200/14 bg-lime-100/[0.035]",
  },
  indoor: {
    accentText: "text-emerald-50/90",
    softText: "text-white/72",
    titleGlow: "drop-shadow-[0_0_18px_rgba(110,231,183,0.14)]",
    heroMist: "radial-gradient(620px 280px at 18% 18%, rgba(52,211,153,0.18), transparent 72%), radial-gradient(700px 360px at 86% 24%, rgba(74,222,128,0.14), transparent 74%)",
    gridMist: "radial-gradient(820px 340px at 20% 0%, rgba(16,185,129,0.14), transparent 72%), radial-gradient(720px 300px at 100% 100%, rgba(74,222,128,0.10), transparent 74%)",
    badgeTone: "border-emerald-200/15 bg-emerald-100/[0.04]",
    heroPanel: "border-emerald-200/14 bg-emerald-100/[0.035]",
  },
  herbs: {
    accentText: "text-yellow-50/90",
    softText: "text-lime-50/72",
    titleGlow: "drop-shadow-[0_0_18px_rgba(250,204,21,0.15)]",
    heroMist: "radial-gradient(620px 280px at 18% 18%, rgba(250,204,21,0.18), transparent 72%), radial-gradient(700px 360px at 86% 24%, rgba(163,230,53,0.14), transparent 74%)",
    gridMist: "radial-gradient(820px 340px at 20% 0%, rgba(234,179,8,0.14), transparent 72%), radial-gradient(720px 300px at 100% 100%, rgba(163,230,53,0.10), transparent 74%)",
    badgeTone: "border-yellow-200/15 bg-yellow-100/[0.04]",
    heroPanel: "border-yellow-200/14 bg-yellow-100/[0.035]",
  },
};

export default function CategoryPageClient({
  category,
}: {
  category: PlantCategory;
}) {
  const theme = CATEGORY_THEMES[category.id] ?? CATEGORY_THEMES.indoor;

  return (
    <main className="relative flex flex-col min-h-screen bg-transparent">
      <Navbar />

      {/* Hero Banner */}
      <section className="pt-32 pb-16 px-6">
        <div className="relative max-w-6xl mx-auto">
          <div className="pointer-events-none absolute inset-x-[-8%] inset-y-[-14%] rounded-[56px] blur-3xl opacity-100" style={{ backgroundImage: theme.heroMist }} />

          {/* Floating emojis */}
          {[...Array(8)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-4xl select-none pointer-events-none"
              style={{
                left: `${10 + i * 11}%`,
                top: `${20 + (i % 3) * 20}%`,
                opacity: 0.06,
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

          <div className={`relative z-10 rounded-[32px] border px-6 py-7 backdrop-blur-sm shadow-[0_20px_60px_rgba(0,0,0,0.18)] ${theme.heroPanel}`}>
          <BackButton fallbackHref="/#plants" label="Back" className="mb-6" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 mb-3"
          >
            <span className="text-6xl">{category.emoji}</span>
            <div className={`flex items-center gap-1 rounded-full border px-3 py-1 backdrop-blur-sm ${theme.badgeTone}`}>
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
            className={`text-4xl sm:text-6xl font-extrabold text-white mb-4 ${theme.titleGlow}`}
          >
            {category.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`max-w-2xl text-lg leading-relaxed ${theme.softText}`}
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
          </div>{/* z-10 */}
        </div>{/* relative max-w-6xl */}
      </section>

      {/* Plants Grid */}
      <section className="py-16 px-6 flex-1">
        <div className="relative max-w-6xl mx-auto">
          <div className="pointer-events-none absolute inset-x-[-8%] top-[-10%] bottom-[8%] rounded-[64px] blur-3xl opacity-100" style={{ backgroundImage: theme.gridMist }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {category.plants.map((plant, i) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                categoryId={category.id}
                categoryName={category.name}
                categoryEmoji={category.emoji}
                delay={i * 0.08}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer minimal />
    </main>
  );
}
