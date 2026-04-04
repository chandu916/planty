"use client";

import { motion } from "framer-motion";
import { Leaf, HeartHandshake, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/plants/bonsai", label: "Bonsai" },
  { href: "/plants/flowering", label: "Flowering Plants" },
  { href: "/plants/water", label: "Water Plants" },
  { href: "/plants/succulents", label: "Succulents" },
  { href: "/plants/indoor", label: "Indoor Greens" },
  { href: "/plants/herbs", label: "Herbs" },
];

export default function Footer({ minimal = false }: { minimal?: boolean }) {
  return (
    <footer className="relative border-t border-green-700/40 bg-emerald-950 px-4 sm:px-6">
      <div className="relative z-10 max-w-6xl mx-auto">
        {!minimal && (
          <div className="mb-12 grid grid-cols-1 gap-10 py-16 md:grid-cols-3">
            {/* Brand */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Leaf size={24} className="text-green-400" />
                <span className="text-2xl font-bold text-white">
                  Plan<span className="text-green-400">ty</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed text-green-200/50">
                Bringing nature closer to you, one plant at a time. Curated, cared,
                and delivered fresh.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">Explore</h4>
              <ul className="space-y-2">
                {FOOTER_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="inline-flex">
                      <motion.span
                        whileHover={{ x: 4, color: "#4ade80" }}
                        className="text-sm text-green-200/50 transition-colors hover:text-green-400"
                      >
                        {item.label}
                      </motion.span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">Connect</h4>
              <div className="mb-4 flex flex-wrap gap-3 text-green-200/50">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs">
                  <HeartHandshake size={14} className="text-green-300" />
                  Plant care support
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs">
                  <MapPin size={14} className="text-green-300" />
                  India delivery zones
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs">
                  <Phone size={14} className="text-green-300" />
                  Daily support hours
                </div>
              </div>
              <motion.a
                href="mailto:cchandhan021@gmail.com"
                whileHover={{ x: 2 }}
                className="flex items-center gap-2 text-sm text-green-300 transition-colors hover:text-green-400"
              >
                <Mail size={14} />
                cchandhan021@gmail.com
              </motion.a>
            </div>
          </div>
        )}

        <div className="py-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-2"
          >
            <p className="text-sm text-green-200/40">
              © {new Date().getFullYear()} Planty. Grown with 
              <span className="text-red-400 mx-1 inline-block animate-pulse">❤️</span>
              by
              <span className="ml-1 font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Chandu
              </span>
            </p>
            <p className="text-xs text-green-200/30">
              Bringing nature, one plant at a time 🌿
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}

