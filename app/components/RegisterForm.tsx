"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { CheckCircle, Loader2, MapPin, Phone, Mail, User, AlertCircle, Lock, Eye, EyeOff } from "lucide-react";
import { triggerFormFeedback } from "@/lib/formFeedback";
import { useUserStore } from "@/lib/userStore";

const schema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  address: z.string().min(5, "Address is too short"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

const indianStates = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Delhi","Jammu and Kashmir","Ladakh","Puducherry",
];

export default function RegisterForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const loginUser = useUserStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setStatus("loading");
    setServerMessage("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (json.success) {
        setStatus("success");
        setServerMessage(json.message);
        triggerFormFeedback({ sound: "auth" });
        loginUser({
          email: data.email,
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
        });
        reset();
      } else {
        if (json.errors) {
          for (const [field, msgs] of Object.entries(json.errors)) {
            setError(field as keyof FormData, {
              message: (msgs as string[])[0],
            });
          }
        }
        setStatus("error");
        setServerMessage(json.message ?? "Please fix the errors above.");
        triggerFormFeedback({ sound: "error", haptic: true });
      }
    } catch {
      setStatus("error");
      setServerMessage("Network error. Please try again.");
      triggerFormFeedback({ sound: "error", haptic: true });
    }
  };

  const onInvalid = () => {
    setStatus("error");
    setServerMessage("Please fix the highlighted fields.");
    triggerFormFeedback({ sound: "error", haptic: true });
  };

  return (
    <section id="register" className="relative py-24 px-6">
      <div className="relative z-10 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Register for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              Delivery
            </span>
          </h2>
          <p className="text-green-200/60 leading-relaxed">
            Share your details and we&apos;ll bring your chosen plants right to your doorstep.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm"
        >
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 py-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="text-green-400"
                >
                  <CheckCircle size={64} />
                </motion.div>
                <h3 className="text-2xl font-bold text-white">You&apos;re registered!</h3>
                <p className="text-green-200/70 max-w-sm">{serverMessage}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStatus("idle")}
                  className="mt-4 px-6 py-2.5 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-sm font-medium"
                >
                  Register another
                </motion.button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit(onSubmit, onInvalid)}
                className="space-y-5"
              >
                {/* Full Name */}
                <Field
                  label="Full Name"
                  icon={<User size={15} />}
                  error={errors.fullName?.message}
                >
                  <input
                    {...register("fullName")}
                    type="text"
                    placeholder="Chandra Sekhar"
                    className={inputClass(!!errors.fullName)}
                  />
                </Field>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field
                    label="Email"
                    icon={<Mail size={15} />}
                    error={errors.email?.message}
                  >
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="you@email.com"
                      className={inputClass(!!errors.email)}
                    />
                  </Field>
                  <Field
                    label="Mobile Number"
                    icon={<Phone size={15} />}
                    error={errors.phone?.message}
                  >
                    <input
                      {...register("phone")}
                      type="tel"
                      placeholder="9876543210"
                      maxLength={10}
                      className={inputClass(!!errors.phone)}
                    />
                  </Field>
                </div>

                {/* Password + Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field
                    label="Password"
                    icon={<Lock size={15} />}
                    error={errors.password?.message}
                  >
                    <div className="relative">
                      <input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        className={inputClass(!!errors.password) + " pr-11"}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="input-icon-button text-green-400/50 hover:text-green-400"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  </Field>
                  <Field
                    label="Confirm Password"
                    icon={<Lock size={15} />}
                    error={errors.confirmPassword?.message}
                  >
                    <div className="relative">
                      <input
                        {...register("confirmPassword")}
                        type={showConfirm ? "text" : "password"}
                        placeholder="Re-enter password"
                        className={inputClass(!!errors.confirmPassword) + " pr-11"}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          className="input-icon-button text-green-400/50 hover:text-green-400"
                          aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                        >
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  </Field>
                </div>

                {/* Address */}
                <Field
                  label="Delivery Address"
                  icon={<MapPin size={15} />}
                  error={errors.address?.message}
                >
                  <textarea
                    {...register("address")}
                    rows={3}
                    placeholder="House no., Street, Locality"
                    className={inputClass(!!errors.address) + " resize-none"}
                  />
                </Field>

                {/* City + State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="City" error={errors.city?.message}>
                    <input
                      {...register("city")}
                      type="text"
                      placeholder="Hyderabad"
                      className={inputClass(!!errors.city)}
                    />
                  </Field>
                  <Field label="State" error={errors.state?.message}>
                    <select
                      {...register("state")}
                      className={inputClass(!!errors.state) + " bg-transparent"}
                    >
                      <option value="" className="bg-emerald-950">Select state</option>
                      {indianStates.map((s) => (
                        <option key={s} value={s} className="bg-emerald-950">
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Pincode */}
                <Field label="Pincode" error={errors.pincode?.message}>
                  <input
                    {...register("pincode")}
                    type="text"
                    placeholder="500001"
                    maxLength={6}
                    className={inputClass(!!errors.pincode)}
                  />
                </Field>

                {serverMessage && status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                  >
                    <AlertCircle size={14} />
                    {serverMessage}
                  </motion.div>
                )}

                <motion.button
                  data-sound="auth"
                  data-sound-submit="deferred"
                  type="submit"
                  disabled={status === "loading"}
                  whileHover={{ scale: status === "loading" ? 1 : 1.02, boxShadow: "0 0 30px rgba(74,222,128,0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold text-base transition-colors shadow-xl shadow-green-500/20 flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Registering…
                    </>
                  ) : (
                    "Register & Get Plants Delivered 🌿"
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

function inputClass(hasError: boolean) {
  return [
    "w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-green-200/30 text-sm",
    "focus:outline-none focus:ring-2 transition-all duration-200",
    hasError
      ? "border-red-500/50 focus:ring-red-500/30"
      : "border-white/10 hover:border-green-500/30 focus:border-green-500/50 focus:ring-green-500/20",
  ].join(" ");
}

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-green-200/80 text-xs font-medium">
        {icon && <span className="text-green-400">{icon}</span>}
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-red-400 text-xs"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
