"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  X,
  Leaf,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Key,
  ArrowRight,
  Heart,
  Package,
  TicketPercent,
} from "lucide-react";
import { useUserStore } from "@/lib/userStore";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import AccountShell from "./components/AccountShell";
import { triggerFormFeedback } from "@/lib/formFeedback";
import type { User as UserType } from "@/lib/schema";

const indianStates = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Delhi","Jammu and Kashmir","Ladakh","Puducherry",
];

const editSchema = z.object({
  fullName: z.string().min(2, "At least 2 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
  address: z.string().min(5, "Address too short"),
  city: z.string().min(2, "Required"),
  state: z.string().min(2, "Required"),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
});
type EditForm = z.infer<typeof editSchema>;

function FieldRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/8">
      <span className="text-green-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-green-200/50 text-xs mb-0.5">{label}</p>
        <p className="text-white text-sm font-medium">{value}</p>
      </div>
    </div>
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

type ProfileInitialUser = {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export default function ProfilePageClient({ initialUser }: { initialUser: ProfileInitialUser }) {
  const router = useRouter();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const loggedInUser = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const login = useUserStore((s) => s.login);
  const updateLoggedInUser = useUserStore((s) => s.updateUser);
  const hasActiveSession = isLoggedIn || !!initialUser;
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [fetchError, setFetchError] = useState("");

  // Change password state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwStatus, setPwStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pwError, setPwError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditForm>({ resolver: zodResolver(editSchema) });

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/profile");
      const json = await res.json();
      if (json.success) {
        setUser(json.user);
        reset({
          fullName: json.user.fullName,
          phone: json.user.phone,
          address: json.user.address,
          city: json.user.city,
          state: json.user.state,
          pincode: json.user.pincode,
        });
      } else {
        setFetchError(json.message || "User not found. Please register first.");
      }
    } catch {
      setFetchError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [reset]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setPwError("New passwords do not match.");
      setPwStatus("error");
      triggerFormFeedback({ sound: "error", haptic: true });
      return;
    }
    setPwStatus("saving");
    setPwError("");
    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (json.success) {
        setPwStatus("saved");
        triggerFormFeedback({ sound: "default" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setTimeout(() => {
          void fetch("/api/auth/session", { method: "POST", credentials: "include" }).catch(() => undefined);
          logout();
          router.push("/login");
        }, 1200);
      } else {
        setPwError(json.message || "Failed to update password.");
        setPwStatus("error");
        triggerFormFeedback({ sound: "error", haptic: true });
      }
    } catch {
      setPwError("Network error. Please try again.");
      setPwStatus("error");
      triggerFormFeedback({ sound: "error", haptic: true });
    }
  };

  useEffect(() => {
    login(initialUser);
  }, [initialUser, login]);

  useEffect(() => {
    const email = loggedInUser?.email ?? initialUser.email;

    if (!hasActiveSession || !email) {
      setUser(null);
      setFetchError("");
      setShowPasswordSection(false);
      return;
    }

    void fetchUser();
  }, [fetchUser, hasActiveSession, initialUser.email, loggedInUser?.email]);

  const onSave = async (data: EditForm) => {
    if (!user) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        setUser(json.user);
        updateLoggedInUser({
          email: json.user.email,
          fullName: json.user.fullName,
          phone: json.user.phone,
          address: json.user.address,
          city: json.user.city,
          state: json.user.state,
          pincode: json.user.pincode,
        });
        setSaveStatus("saved");
        setEditing(false);
        triggerFormFeedback({ sound: "default" });
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
        triggerFormFeedback({ sound: "error", haptic: true });
      }
    } catch {
      setSaveStatus("error");
      triggerFormFeedback({ sound: "error", haptic: true });
    }
  };

  const onInvalidSave = () => {
    setSaveStatus("error");
    triggerFormFeedback({ sound: "error", haptic: true });
  };

  return (
    <AccountShell
      title="My Profile"
      description="Manage your delivery details, protect your password, and move between orders, coupons, and wishlist from one premium account space."
    >
      <div className="mx-auto max-w-3xl">

        {!hasActiveSession ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-[28px] border border-white/10 bg-white/5 p-8"
          >
            <div className="flex flex-col items-center gap-3 mb-8 text-center">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl"
              >
                🌿
              </motion.div>
              <h2 className="text-xl font-bold text-white">Sign in to view your profile</h2>
              <p className="text-green-200/50 text-sm">
                Profile details and orders are available only after a normal user login.
              </p>
            </div>

            <div className="space-y-3">
              <Link href="/login" className="block">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3.5 text-sm font-bold text-black transition-colors hover:bg-green-400"
                >
                  <User size={16} />
                  Go to Login
                </motion.span>
              </Link>

              <p className="text-center text-green-200/30 text-xs">
                Not registered?{" "}
                <Link href="/#register" className="text-green-400 hover:text-green-300">
                  Register here
                </Link>
              </p>
            </div>
          </motion.div>
        ) : loading && !user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-3 rounded-[28px] border border-white/10 bg-white/5 p-8 text-green-300/70"
          >
            <Loader2 size={18} className="animate-spin" />
            Loading your profile...
          </motion.div>
        ) : !user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-[28px] border border-white/10 bg-white/5 p-8"
          >
            <div className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle size={14} />
              {fetchError || "Unable to load your profile right now."}
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="rounded-[28px] border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white">Edit Details</h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setEditing(false);
                      reset({
                        fullName: user.fullName,
                        phone: user.phone,
                        address: user.address,
                        city: user.city,
                        state: user.state,
                        pincode: user.pincode,
                      });
                    }}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-green-200/50 hover:text-red-400 transition-all"
                  >
                    <X size={14} />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit(onSave, onInvalidSave)} className="space-y-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-green-200/70 text-xs mb-1.5">
                      <User size={12} className="text-green-400" /> Full Name
                    </label>
                    <input
                      {...register("fullName")}
                      className={inputClass(!!errors.fullName)}
                      placeholder="Full name"
                    />
                    {errors.fullName && (
                      <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-green-200/70 text-xs mb-1.5">
                      <Phone size={12} className="text-green-400" /> Phone
                    </label>
                    <input
                      {...register("phone")}
                      className={inputClass(!!errors.phone)}
                      placeholder="9876543210"
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-green-200/70 text-xs mb-1.5">
                      <MapPin size={12} className="text-green-400" /> Address
                    </label>
                    <textarea
                      {...register("address")}
                      rows={2}
                      className={inputClass(!!errors.address) + " resize-none"}
                      placeholder="Street, Locality"
                    />
                    {errors.address && (
                      <p className="text-red-400 text-xs mt-1">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-green-200/70 text-xs mb-1.5 block">City</label>
                      <input
                        {...register("city")}
                        className={inputClass(!!errors.city)}
                        placeholder="City"
                      />
                      {errors.city && (
                        <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-green-200/70 text-xs mb-1.5 block">State</label>
                      <select
                        {...register("state")}
                        className={inputClass(!!errors.state) + " bg-transparent"}
                      >
                        {indianStates.map((s) => (
                          <option key={s} value={s} className="bg-emerald-950">
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-green-200/70 text-xs mb-1.5 block">Pincode</label>
                    <input
                      {...register("pincode")}
                      className={inputClass(!!errors.pincode)}
                      placeholder="500001"
                      maxLength={6}
                    />
                    {errors.pincode && (
                      <p className="text-red-400 text-xs mt-1">{errors.pincode.message}</p>
                    )}
                  </div>

                  <motion.button
                    data-sound-submit="deferred"
                    type="submit"
                    disabled={saveStatus === "saving"}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    {saveStatus === "saving" ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.3 }}
                className="space-y-5 rounded-[28px] border border-white/10 bg-white/5 p-6"
              >
                {/* Profile header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-black font-bold text-xl">
                      {user.fullName[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-bold">{user.fullName}</p>
                      <p className="text-green-400/60 text-xs flex items-center gap-1">
                        <Leaf size={10} />
                        Planty member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-green-500/30 hover:border-green-400 text-green-400 hover:text-green-300 text-xs font-medium transition-all"
                  >
                    <Edit3 size={12} />
                    Edit
                  </motion.button>
                </div>

                {saveStatus === "saved" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-green-400 text-sm p-3 rounded-xl bg-green-500/10 border border-green-500/20"
                  >
                    <CheckCircle size={14} />
                    Profile updated successfully!
                  </motion.div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  <FieldRow
                    icon={<User size={15} />}
                    label="Full Name"
                    value={user.fullName}
                  />
                  <FieldRow
                    icon={<Mail size={15} />}
                    label="Email"
                    value={user.email}
                  />
                  <FieldRow
                    icon={<Phone size={15} />}
                    label="Mobile"
                    value={user.phone}
                  />
                  <FieldRow
                    icon={<MapPin size={15} />}
                    label="Delivery Address"
                    value={`${user.address}, ${user.city}, ${user.state} — ${user.pincode}`}
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <Link href="/profile/orders">
                    <div className="rounded-2xl border border-sky-400/15 bg-sky-500/[0.05] p-4 transition hover:border-sky-400/30 hover:bg-sky-500/[0.08]">
                      <Package className="text-sky-300" size={18} />
                      <p className="mt-3 text-sm font-semibold text-white">Orders</p>
                      <p className="mt-1 text-xs leading-5 text-green-100/45">Track order progress and payment receipts.</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sky-200">Open <ArrowRight size={12} /></span>
                    </div>
                  </Link>

                  <Link href="/profile/coupons">
                    <div className="rounded-2xl border border-amber-400/15 bg-amber-500/[0.05] p-4 transition hover:border-amber-400/30 hover:bg-amber-500/[0.08]">
                      <TicketPercent className="text-amber-300" size={18} />
                      <p className="mt-3 text-sm font-semibold text-white">Coupons</p>
                      <p className="mt-1 text-xs leading-5 text-green-100/45">See active savings for seasonal plant drops.</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-amber-200">Open <ArrowRight size={12} /></span>
                    </div>
                  </Link>

                  <Link href="/profile/wishlist">
                    <div className="rounded-2xl border border-rose-400/15 bg-rose-500/[0.05] p-4 transition hover:border-rose-400/30 hover:bg-rose-500/[0.08]">
                      <Heart className="text-rose-300" size={18} />
                      <p className="mt-3 text-sm font-semibold text-white">Wishlist</p>
                      <p className="mt-1 text-xs leading-5 text-green-100/45">Save plants you want to revisit later.</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-rose-200">Open <ArrowRight size={12} /></span>
                    </div>
                  </Link>
                </div>

                <div className="pt-2 space-y-3">
                  {/* Change Password toggle */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowPasswordSection((v) => !v)}
                    className="w-full py-3 rounded-xl border border-green-500/20 hover:bg-green-500/10 text-green-400/70 hover:text-green-400 text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Key size={14} />
                    Change Password
                  </motion.button>

                  {/* Sign out */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      void fetch("/api/auth/session", { method: "POST", credentials: "include" }).catch(() => undefined);
                      logout();
                      setUser(null);
                      setShowPasswordSection(false);
                      router.push("/");
                    }}
                    className="w-full py-3 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-400/60 hover:text-red-400 text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <X size={14} />
                    Sign out of profile
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ── Change Password ──────────────────────────────── */}
        {user && showPasswordSection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-[28px] border border-white/10 bg-white/5 p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Lock size={15} className="text-green-400" />
                Change Password
              </h2>
              <button
                onClick={() => setShowPasswordSection(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-green-200/50 hover:text-red-400 transition-all"
              >
                <X size={13} />
              </button>
            </div>

            {pwStatus === "saved" ? (
              <div className="flex items-center gap-2 text-green-400 text-sm p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <CheckCircle size={14} />
                Password updated successfully!
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="text-green-200/60 text-xs">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="Your current password"
                      className={inputClass(false) + " pr-11"}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <button type="button" onClick={() => setShowCurrentPw((v) => !v)}
                        className="input-icon-button text-green-400/50 hover:text-green-400"
                        aria-label={showCurrentPw ? "Hide current password" : "Show current password"}>
                        {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-green-200/60 text-xs">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="Min. 8 characters"
                      className={inputClass(false) + " pr-11"}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <button type="button" onClick={() => setShowNewPw((v) => !v)}
                        className="input-icon-button text-green-400/50 hover:text-green-400"
                        aria-label={showNewPw ? "Hide new password" : "Show new password"}>
                        {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="text-green-200/60 text-xs">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    placeholder="Re-enter new password"
                    className={inputClass(confirmNewPassword !== "" && confirmNewPassword !== newPassword)}
                  />
                </div>

                {pwError && (
                  <div className="flex items-center gap-2 text-red-400 text-xs p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <AlertCircle size={13} />
                    {pwError}
                  </div>
                )}

                <motion.button
                  data-sound-submit="deferred"
                  type="submit"
                  disabled={pwStatus === "saving"}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  {pwStatus === "saving" ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <>
                      <Lock size={14} />
                      Update Password
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        )}
      </div>
    </AccountShell>
  );
}
