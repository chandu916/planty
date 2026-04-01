"use client";

import { motion } from "framer-motion";
import { Leaf, Globe, Heart, Send, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative py-16 px-6 border-t border-white/5">
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Leaf size={24} className="text-green-400" />
              <span className="text-2xl font-bold text-white">
                Plan<span className="text-green-400">ty</span>
              </span>
            </div>
            <p className="text-green-200/50 text-sm leading-relaxed">
              Bringing nature closer to you, one plant at a time. Curated, cared,
              and delivered fresh.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Explore</h4>
            <ul className="space-y-2">
              {["Bonsai", "Flowering Plants", "Water Plants", "Succulents", "Indoor Greens", "Herbs"].map((item) => (
                <li key={item}>
                  <motion.a
                    href="#plants"
                    whileHover={{ x: 4, color: "#4ade80" }}
                    className="text-green-200/50 hover:text-green-400 text-sm transition-colors"
                  >
                    {item}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Connect</h4>
            <div className="flex gap-4 mb-4">
              {[Globe, Heart, Send].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.2, color: "#4ade80" }}
                  className="text-green-200/40 hover:text-green-400 transition-colors"
                >
                  <Icon size={20} />
                </motion.a>
              ))}
            </div>
            <div className="flex items-center gap-2 text-green-200/50 text-sm">
              <Mail size={14} />
              hello@planty.in
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 text-center text-green-200/30 text-xs">
          © {new Date().getFullYear()} Planty. Grown with 🌿 and love.
        </div>
      </div>
    </footer>
  );
}
