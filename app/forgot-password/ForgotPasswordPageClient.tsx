"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AlertCircle, CheckCircle, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import BackButton from "@/app/components/BackButton";

export default function ForgotPasswordPageClient() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [emailConfigured, setEmailConfigured] = useState(true);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    setResetUrl(null);
    setEmailConfigured(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await response.json();

      if (json.success) {
        setStatus("success");
        setMessage(json.message ?? "Reset instructions are ready.");
        setResetUrl(typeof json.resetUrl === "string" ? json.resetUrl : null);
        setEmailConfigured(json.emailConfigured !== false);
      } else {
        setStatus("error");
        setMessage(json.message ?? "Unable to start password reset.");
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
          <h1 className="text-2xl font-bold text-white">Forgot password</h1>
          <p className="mt-2 text-sm text-green-200/55">
            Enter your account email. In development, the reset link will be shown directly here.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-green-200/75">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500/50" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
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
                {!emailConfigured && resetUrl && (
                  <p className="text-xs text-green-200/70">
                    SMTP is not configured yet, so the reset link is shown below for local development.
                  </p>
                )}
                {resetUrl && (
                  <Link href={resetUrl} className="inline-flex text-sm font-medium text-green-200 underline underline-offset-4 hover:text-white">
                    Open reset link
                  </Link>
                )}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={status === "loading"}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-bold text-black transition-colors hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending…
                </>
              ) : (
                "Continue"
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}