"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Eye, EyeOff, Leaf, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BackButton from "@/app/components/BackButton";
import { useAdminStore } from "@/lib/adminStore";
import { triggerFormFeedback } from "@/lib/formFeedback";
import { useUserStore } from "@/lib/userStore";

export default function LoginPageClient() {
  const router = useRouter();
  const loginUser = useUserStore((s) => s.login);
  const loginAdmin = useAdminStore((s) => s.login);

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
      const credentials = { email, password };

      const adminRes = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const adminJson = await adminRes.json();

      if (adminJson.success && adminJson.admin) {
        useUserStore.getState().logout();
        loginAdmin(adminJson.admin);
        triggerFormFeedback({ sound: "auth" });
        router.push("/admin");
        return;
      }

      if (adminRes.status === 403) {
        setStatus("error");
        setErrorMsg(adminJson.message ?? "This admin account is disabled.");
        triggerFormFeedback({ sound: "error", haptic: true });
        return;
      }

      const userRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const userJson = await userRes.json();

      if (userJson.success && userJson.user) {
        useAdminStore.getState().logout();
        loginUser(userJson.user);
        triggerFormFeedback({ sound: "auth" });
        router.push("/");
      } else {
        setStatus("error");
        setErrorMsg(userJson.message ?? adminJson.message ?? "Invalid email or password.");
        triggerFormFeedback({ sound: "error", haptic: true });
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
      triggerFormFeedback({ sound: "error", haptic: true });
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md pt-14"
      >
        <BackButton fallbackHref="/" label="Back" className="absolute left-0 top-0" />
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
            Sign in with your Planty or admin account
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
                  className="w-full pl-9 pr-11 py-3 rounded-xl bg-white/5 border border-green-500/20 text-white placeholder:text-white/20 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 transition text-sm"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="input-icon-button text-green-500/50 hover:text-green-400 transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
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
              data-sound="auth"
              data-sound-submit="deferred"
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

          <div className="mt-4 text-center text-sm text-green-300/50">
            <Link href="/forgot-password" className="text-green-400 hover:text-green-300 font-medium transition-colors">
              Forgot password?
            </Link>
          </div>

          <div className="mt-6 text-center text-sm text-green-300/50">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-green-400 hover:text-green-300 font-medium transition-colors">
              Register here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
