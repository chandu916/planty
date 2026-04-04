"use client";

import { motion } from "framer-motion";
import { plantCategories, PlantCategory } from "@/lib/plants";
import { Star } from "lucide-react";
import PlantCard from "./PlantCard";

function CategorySection({ category }: { category: PlantCategory }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className="py-20 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-3"
            >
              <span className="text-4xl">{category.emoji}</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
            </motion.div>
            <motion.h2
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl font-bold text-white mb-2"
            >
              {category.name}
            </motion.h2>
            <motion.p
              initial={{ x: -30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-green-200/60 max-w-xl text-sm leading-relaxed"
            >
              {category.description}
            </motion.p>
          </div>

          <motion.a
            href={`/plants/${category.id}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full border border-green-500/40 hover:border-green-400 hover:bg-green-500/10 text-green-400 hover:text-green-300 text-sm font-medium transition-all whitespace-nowrap"
          >
            View All {category.emoji} →
          </motion.a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.plants.map((plant, i) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              categoryId={category.id}
              categoryName={category.name}
              categoryEmoji={category.emoji}
              delay={i * 0.1}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default function PlantSections() {
  return (
    <div id="plants">
      {plantCategories.map((category) => (
        <CategorySection key={category.id} category={category} />
      ))}
    </div>
  );
}
