"use client";

import { motion } from "framer-motion";
import { ChevronDown, Leaf, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950" />

      {/* Floating leaf particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-green-400/20 select-none pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${20 + Math.random() * 40}px`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            rotate: [0, 360],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "easeInOut",
          }}
        >
          🍃
        </motion.div>
      ))}

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(74,222,128,0.12)_0%,_transparent_70%)]" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium mb-8"
        >
          <Sparkles size={14} />
          Nature&apos;s finest, delivered to your door
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-5xl sm:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6"
        >
          Bring Nature{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
            Home
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-lg sm:text-xl text-green-100/70 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Discover hundreds of plant varieties — from ancient bonsai to tropical
          blooms, water plants to air-purifying greens. Curated for every space,
          every soul.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.a
            href="#plants"
            whileHover={{ scale: 1.06, boxShadow: "0 0 32px rgba(74,222,128,0.5)" }}
            whileTap={{ scale: 0.96 }}
            className="px-8 py-4 rounded-full bg-green-500 hover:bg-green-400 text-black font-bold text-base transition-all shadow-xl shadow-green-500/30 flex items-center gap-2"
          >
            <Leaf size={18} />
            Explore Plants
          </motion.a>
          <motion.a
            href="#register"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            className="px-8 py-4 rounded-full border border-green-500/50 hover:border-green-400 text-green-300 hover:text-green-200 font-semibold text-base transition-all backdrop-blur-sm"
          >
            Register for Delivery
          </motion.a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-20 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-green-400/50"
          >
            <ChevronDown size={28} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
