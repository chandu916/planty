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
            <motion.a
              href="mailto:cchandhan021@gmail.com"
              whileHover={{ x: 2 }}
              className="flex items-center gap-2 text-green-300 hover:text-green-400 text-sm transition-colors"
            >
              <Mail size={14} />
              cchandhan021@gmail.com
            </motion.a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-2"
          >
            <p className="text-green-200/40 text-sm">
              © {new Date().getFullYear()} Planty. Grown with 
              <span className="text-red-400 mx-1 inline-block animate-pulse">❤️</span>
              by
              <span className="ml-1 font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Chandu
              </span>
            </p>
            <p className="text-green-200/30 text-xs">
              Bringing nature, one plant at a time 🌿
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
