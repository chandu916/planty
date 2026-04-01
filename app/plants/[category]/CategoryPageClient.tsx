"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Star, Leaf } from "lucide-react";
import Link from "next/link";
import PlantCard from "@/app/components/PlantCard";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import type { PlantCategory } from "@/lib/plants";

export default function CategoryPageClient({
  category,
}: {
  category: PlantCategory;
}) {
  return (
    <main className="flex flex-col min-h-screen bg-black">
      <Navbar />

      {/* Hero Banner */}
      <section className={`relative pt-32 pb-16 px-6 overflow-hidden`}>
        <div
          className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-20`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(74,222,128,0.1)_0%,_transparent_60%)]" />

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
          <Link
            href="/#plants"
            className="inline-flex items-center gap-2 text-green-400/70 hover:text-green-400 text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to all plants
          </Link>

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
            className="text-4xl sm:text-6xl font-extrabold text-white mb-4"
          >
            {category.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-green-200/60 max-w-2xl text-lg leading-relaxed"
          >
            {category.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mt-4 text-green-400/60 text-sm"
          >
            <Leaf size={14} />
            {category.plants.length} plants available
          </motion.div>
        </div>
      </section>

      {/* Plants Grid */}
      <section className="py-16 px-6 flex-1">
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
