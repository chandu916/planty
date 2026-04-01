"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PlantCategory } from "@/lib/plants";

interface Props {
  plant: PlantCategory["plants"][0];
  categoryName: string;
  categoryEmoji: string;
  delay?: number;
  openCartOnAdd?: boolean;
}

export default function PlantCard({
  plant,
  categoryName,
  categoryEmoji,
  delay = 0,
  openCartOnAdd = false,
}: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const inCart = items.some((i) => i.id === plant.id);

  const handleAdd = () => {
    addItem({
      id: plant.id,
      name: plant.name,
      price: plant.price,
      emoji: categoryEmoji,
      categoryName,
    });
    setAdded(true);
    // Brief flash then navigate to cart so the user always sees their cart
    setTimeout(() => {
      setAdded(false);
      router.push("/cart");
    }, 700);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, boxShadow: "0 20px 60px rgba(74,222,128,0.2)" }}
      className="relative group bg-white/5 border border-white/10 hover:border-green-400/40 rounded-2xl p-5 cursor-pointer transition-colors overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

      {plant.badge && (
        <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">
          {plant.badge}
        </span>
      )}

      <div className="w-full h-32 rounded-xl bg-gradient-to-br from-green-900/50 to-emerald-800/30 flex items-center justify-center mb-4 group-hover:from-green-800/60 transition-all duration-300">
        <motion.span
          className="text-5xl"
          whileHover={{ scale: 1.2, rotate: 10 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {categoryEmoji}
        </motion.span>
      </div>

      <h4 className="text-white font-semibold text-base mb-1">{plant.name}</h4>
      <p className="text-green-200/60 text-xs mb-2 leading-relaxed">{plant.description}</p>
      <p className="text-green-400/70 text-xs mb-4">{plant.care}</p>

      <div className="flex items-center justify-between">
        <span className="text-green-300 font-bold text-lg">₹{plant.price}</span>
        <button
          onClick={handleAdd}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 border ${
            added || inCart
              ? "bg-green-500 text-black border-green-500"
              : "bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-black border-green-500/30"
          }`}
        >
          {added ? <Check size={12} /> : <ShoppingCart size={12} />}
          {added ? "Added!" : inCart ? "In Cart" : "Add to Cart"}
        </button>
      </div>
    </motion.div>
  );
}
