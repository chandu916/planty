"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/lib/adminStore";
import { Lock, Mail, Eye, EyeOff, Leaf, AlertCircle, Loader2 } from "lucide-react";
import BackButton from "@/app/components/BackButton";

export default function AdminLoginClient() {
  const router = useRouter();
  const { login } = useAdminStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (json.success) {
        login(json.admin);
        router.push("/admin");
      } else {
        setError(json.message || "Invalid credentials.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-transparent flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md pt-14"
      >
        <BackButton fallbackHref="/" label="Back" className="absolute left-0 top-0" />

        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-5xl"
          >
            🌿
          </motion.div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Leaf className="text-green-400" size={24} />
            Planty Admin
          </h1>
          <p className="text-green-200/40 text-sm">Sign in to manage orders and users</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-green-200/70 text-xs font-medium">
                <Mail size={12} className="text-green-400" />
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@planty.in"
                required
                className="w-full bg-white/5 border border-white/10 hover:border-green-500/30 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 rounded-xl px-4 py-3 text-white text-sm placeholder-green-200/30 focus:outline-none transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-green-200/70 text-xs font-medium">
                <Lock size={12} className="text-green-400" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="w-full bg-white/5 border border-white/10 hover:border-green-500/30 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 rounded-xl px-4 py-3 pr-10 text-white text-sm placeholder-green-200/30 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400/50 hover:text-green-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02, boxShadow: "0 0 30px rgba(74,222,128,0.3)" }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 rounded-2xl bg-green-500 hover:bg-green-400 disabled:opacity-60 text-black font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Sign In
                </>
              )}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-green-200/20 text-xs mt-6">
          Default: admin@planty.in · Planty@Admin2026
        </p>
      </motion.div>
    </main>
  );
}
