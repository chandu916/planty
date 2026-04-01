import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LoggedInUser {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface UserStore {
  email: string | null;           // kept for profile lookup backward compat
  isLoggedIn: boolean;
  user: LoggedInUser | null;
  setEmail: (email: string) => void;
  clearEmail: () => void;
  login: (user: LoggedInUser) => void;
  logout: () => void;
  updateUser: (updates: Partial<LoggedInUser>) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      email: null,
      isLoggedIn: false,
      user: null,
      setEmail: (email) => set({ email }),
      clearEmail: () => set({ email: null }),
      login: (user) => set({ isLoggedIn: true, user, email: user.email }),
      logout: () => set({ isLoggedIn: false, user: null, email: null }),
      updateUser: (updates) =>
        set((s) => ({
          user: s.user ? { ...s.user, ...updates } : s.user,
        })),
    }),
    { name: "planty-user" }
  )
);
