import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlantCatalogItem } from "@/lib/plants";

interface WishlistStore {
  items: PlantCatalogItem[];
  toggleItem: (item: PlantCatalogItem) => void;
  removeItem: (id: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set) => ({
      items: [],
      toggleItem: (item) =>
        set((state) => ({
          items: state.items.some((wishlistItem) => wishlistItem.id === item.id)
            ? state.items.filter((wishlistItem) => wishlistItem.id !== item.id)
            : [item, ...state.items],
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clearWishlist: () => set({ items: [] }),
    }),
    { name: "planty-wishlist" },
  ),
);