"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AlertCircle, CheckCircle, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import BackButton from "@/app/components/BackButton";

export default function ResetPasswordPageClient({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      setStatus("error");
      setMessage("Reset token is missing.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await response.json();

      if (json.success) {
        setStatus("success");
        setMessage(json.message ?? "Password reset successful.");
      } else {
        setStatus("error");
        setMessage(json.message ?? "Unable to reset password.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md pt-14"
      >
        <BackButton fallbackHref="/login" label="Back" className="absolute left-0 top-0" />
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-white">Reset password</h1>
          <p className="mt-2 text-sm text-green-200/55">Choose a new password for your Planty account.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-green-200/75">New password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500/50" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-green-500/20 bg-white/5 py-3 pl-9 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-green-200/75">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500/50" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-xl border border-green-500/20 bg-white/5 py-3 pl-9 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30"
                />
              </div>
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-400">
                <AlertCircle size={16} className="shrink-0" />
                {message}
              </div>
            )}

            {status === "success" && (
              <div className="space-y-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="shrink-0" />
                  {message}
                </div>
                <Link href="/login" className="inline-flex text-sm font-medium text-green-200 underline underline-offset-4 hover:text-white">
                  Go to login
                </Link>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={status === "loading" || status === "success"}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-bold text-black transition-colors hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Resetting…
                </>
              ) : (
                "Reset password"
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}