"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Leaf, ShoppingCart, UserCircle2, LogIn, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cartStore";
import { useUserStore } from "@/lib/userStore";
import { useRouter } from "next/navigation";

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Only read Zustand stores after hydration to avoid SSR mismatch
  const totalQty = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isLoggedIn) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetInactivityTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
        router.push("/login");
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => window.addEventListener(event, resetInactivityTimer));
    resetInactivityTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetInactivityTimer));
    };
  }, [mounted, isLoggedIn, logout, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-sm bg-transparent"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <motion.div
          whileHover={{ rotate: 20, scale: 1.2 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="text-green-400"
        >
          <Leaf size={28} />
        </motion.div>
        <span className="text-2xl font-bold tracking-tight text-white">
          Plan<span className="text-green-400">ty</span>
        </span>
      </Link>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-8">
        {["Plants", "Categories", "About"].map((item) => (
          <motion.a
            key={item}
            href={`#${item.toLowerCase()}`}
            whileHover={{ color: "#4ade80", y: -2 }}
            className="text-green-100/80 hover:text-green-400 transition-colors text-sm font-medium"
          >
            {item}
          </motion.a>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Admin link */}
        <Link href="/admin">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Admin Dashboard"
            className="w-9 h-9 rounded-full border border-green-500/30 hover:border-green-400 flex items-center justify-center text-green-400 hover:text-green-300 transition-all"
          >
            <LayoutDashboard size={18} />
          </motion.div>
        </Link>

        {/* Profile */}
        <Link href="/profile">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="My Profile"
            className="w-9 h-9 rounded-full border border-green-500/30 hover:border-green-400 flex items-center justify-center text-green-400 hover:text-green-300 transition-all"
          >
            <UserCircle2 size={20} />
          </motion.div>
        </Link>

        {/* Cart */}
        <Link href="/cart">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Cart"
            className="relative w-9 h-9 rounded-full border border-green-500/30 hover:border-green-400 flex items-center justify-center text-green-400 hover:text-green-300 transition-all"
          >
            <ShoppingCart size={18} />
            {mounted && totalQty > 0 && (
              <AnimatePresence>
                <motion.span
                  key="badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 text-black text-[10px] font-bold flex items-center justify-center"
                >
                  {totalQty > 9 ? "9+" : totalQty}
                </motion.span>
              </AnimatePresence>
            )}
          </motion.div>
        </Link>

        {/* Login / User greeting / Logout */}
        {mounted ? (
          isLoggedIn ? (
            <div className="flex items-center gap-2">
              {user ? (
                <span className="hidden sm:block text-green-300 text-sm font-medium">
                  Hi, {user.fullName.split(" ")[0]}
                </span>
              ) : null}
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                title="Logout"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-green-500/40 hover:border-red-400 text-green-400 hover:text-red-400 transition-all text-sm font-medium"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </div>
          ) : (
            <Link href="/login">
              <motion.div
                data-bubble="true"
                data-sound="auth"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-500 hover:bg-green-400 text-black font-semibold text-sm transition-colors shadow-lg shadow-green-500/30"
              >
                <LogIn size={15} />
                Login
              </motion.div>
            </Link>
          )
        ) : (
          /* Placeholder while hydrating — prevents layout shift */
          <div className="w-20 h-9" />
        )}
      </div>
    </motion.nav>
  );
}
