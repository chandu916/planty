"use client";

import { motion } from "framer-motion";
import { Heart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import PlantCard from "@/app/components/PlantCard";
import AccountShell from "@/app/profile/components/AccountShell";
import { useUserStore } from "@/lib/userStore";
import { useWishlistStore } from "@/lib/wishlistStore";

type ProfileInitialUser = {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export default function WishlistPageClient({ initialUser }: { initialUser: ProfileInitialUser }) {
  const login = useUserStore((state) => state.login);
  const items = useWishlistStore((state) => state.items);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  useEffect(() => {
    login(initialUser);
  }, [initialUser, login]);

  return (
    <AccountShell
      title="Wishlist"
      description="Collect the plants you want to buy next, compare styles later, and keep your favorites separate from the cart."
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-3 rounded-[28px] border border-white/10 bg-white/[0.045] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-green-100/35">Saved Picks</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{items.length} plant{items.length !== 1 ? "s" : ""} in your wishlist</h2>
            <p className="mt-2 text-sm text-green-100/45">Tap the heart on any plant card to add or remove it here.</p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:border-red-400/35"
            >
              <Trash2 size={14} />
              Clear Wishlist
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center rounded-[28px] border border-white/10 bg-white/[0.045] px-6 py-16 text-center"
          >
            <div className="rounded-full border border-rose-400/15 bg-rose-500/10 p-4 text-rose-300">
              <Heart size={24} />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-white">Your wishlist is empty</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-green-100/45">
              Browse the collection and tap the heart on a plant card to keep it saved here.
            </p>
            <Link href="/search?q=indoor">
              <span className="mt-6 inline-flex rounded-full border border-green-400/25 bg-green-500/10 px-5 py-2 text-sm font-medium text-green-200 transition hover:border-green-400/40 hover:text-white">
                Discover Plants
              </span>
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((plant, index) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                categoryId={plant.categoryId}
                categoryName={plant.categoryName}
                categoryEmoji={plant.categoryEmoji}
                delay={index * 0.06}
              />
            ))}
          </div>
        )}
      </div>
    </AccountShell>
  );
}