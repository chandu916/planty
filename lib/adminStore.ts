import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AdminUser {
  email: string;
  name: string;
  role: string;
}

interface AdminStore {
  isLoggedIn: boolean;
  admin: AdminUser | null;
  login: (admin: AdminUser) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      admin: null,
      login: (admin) => set({ isLoggedIn: true, admin }),
      logout: () => set({ isLoggedIn: false, admin: null }),
    }),
    { name: "planty-admin" }
  )
);
