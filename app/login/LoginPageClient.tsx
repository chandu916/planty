"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Eye, EyeOff, Leaf, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/userStore";

export default function LoginPageClient() {
  const router = useRouter();
  const loginUser = useUserStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (json.success && json.user) {
        loginUser(json.user);
        // Redirect to the page they came from, or profile
        router.push("/profile");
      } else {
        setStatus("error");
        setErrorMsg(json.message ?? "Invalid email or password.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(74,222,128,0.06)_0%,_transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Leaf size={28} className="text-green-400" />
          <span className="text-3xl font-bold text-white">
            Plan<span className="text-green-400">ty</span>
          </span>
        </div>

        <div className="bg-white/5 border border-green-500/20 rounded-2xl p-8 shadow-2xl shadow-green-900/20 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">Welcome back</h1>
          <p className="text-green-300/60 text-sm text-center mb-8">
            Sign in to manage your orders and profile
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-green-200/80 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-green-500/20 text-white placeholder:text-white/20 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-green-200/80 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-3 rounded-xl bg-white/5 border border-green-500/20 text-white placeholder:text-white/20 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500/50 hover:text-green-400 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {status === "error" && (
              <div className="flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-500/20 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={16} className="shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={status === "loading"}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold text-sm transition-colors shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm text-green-300/50">
            Don&apos;t have an account?{" "}
            <Link href="/#register" className="text-green-400 hover:text-green-300 font-medium transition-colors">
              Register here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
