"use client";

import { motion, AnimatePresence } from "framer-motion";
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
  ShoppingBag,
  Clock,
  XCircle,
  PackageOpen,
  ChevronDown,
  ChevronUp,
  Key,
} from "lucide-react";
import { useUserStore } from "@/lib/userStore";
import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import BackButton from "@/app/components/BackButton";
import type { User as UserType } from "@/lib/schema";

interface OrderItem {
  id: string;
  name: string;
  emoji: string;
  categoryName: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: "pending" | "accepted" | "declined";
  deliveryStatus: "not_shipped" | "shipped" | "out_for_delivery" | "delivered";
  createdAt: string;
}

const DELIVERY_LABELS: Record<string, { label: string; color: string }> = {
  not_shipped:      { label: "Not Shipped",      color: "text-zinc-400" },
  shipped:          { label: "Shipped",          color: "text-blue-400" },
  out_for_delivery: { label: "Out for Delivery", color: "text-orange-400" },
  delivered:        { label: "Delivered",        color: "text-green-400" },
};

const STATUS_STYLES = {
  pending:  { bg: "bg-yellow-500/15 border-yellow-500/30 text-yellow-400",  icon: Clock,        label: "Pending" },
  accepted: { bg: "bg-green-500/15 border-green-500/30 text-green-400",    icon: CheckCircle,  label: "Accepted" },
  declined: { bg: "bg-red-500/15 border-red-500/30 text-red-400",          icon: XCircle,      label: "Declined" },
};

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

export default function ProfilePageClient() {
  const { email, setEmail } = useUserStore();
  const [emailInput, setEmailInput] = useState("");
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [fetchError, setFetchError] = useState("");

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

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

  const fetchUser = async (em: string) => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch(`/api/profile?email=${encodeURIComponent(em)}`);
      const json = await res.json();
      if (json.success) {
        setUser(json.user);
        setEmail(em);
        reset({
          fullName: json.user.fullName,
          phone: json.user.phone,
          address: json.user.address,
          city: json.user.city,
          state: json.user.state,
          pincode: json.user.pincode,
        });
        fetchOrders(em);
      } else {
        setFetchError(json.message || "User not found. Please register first.");
      }
    } catch {
      setFetchError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (em: string) => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(em)}`);
      const json = await res.json();
      if (json.success) setOrders(json.orders);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword !== confirmNewPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    setPwStatus("saving");
    setPwError("");
    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, currentPassword, newPassword }),
      });
      const json = await res.json();
      if (json.success) {
        setPwStatus("saved");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setTimeout(() => { setPwStatus("idle"); setShowPasswordSection(false); }, 2000);
      } else {
        setPwError(json.message || "Failed to update password.");
        setPwStatus("error");
      }
    } catch {
      setPwError("Network error. Please try again.");
      setPwStatus("error");
    }
  };

  useEffect(() => {
    if (email) fetchUser(email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = async (data: EditForm) => {
    if (!user) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, ...data }),
      });
      const json = await res.json();
      if (json.success) {
        setUser(json.user);
        setSaveStatus("saved");
        setEditing(false);
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-transparent">
      <Navbar />

      <div className="flex-1 pt-24 pb-16 px-4 sm:px-6 max-w-2xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <BackButton fallbackHref="/" label="Back" className="mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
            <User className="text-green-400" size={32} />
            My Profile
          </h1>
        </motion.div>

        {!user ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8"
          >
            <div className="flex flex-col items-center gap-3 mb-8 text-center">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl"
              >
                🌿
              </motion.div>
              <h2 className="text-xl font-bold text-white">Find Your Profile</h2>
              <p className="text-green-200/50 text-sm">
                Enter the email you registered with to view your details.
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400/60"
                />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchUser(emailInput)}
                  className="w-full bg-white/5 border border-white/10 hover:border-green-500/30 focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-green-200/30 focus:outline-none transition-all"
                />
              </div>

              {fetchError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                >
                  <AlertCircle size={14} />
                  {fetchError}
                </motion.div>
              )}

              <motion.button
                disabled={loading || !emailInput}
                onClick={() => fetchUser(emailInput)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3.5 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <User size={16} />
                    View Profile
                  </>
                )}
              </motion.button>

              <p className="text-center text-green-200/30 text-xs">
                Not registered?{" "}
                <Link href="/#register" className="text-green-400 hover:text-green-300">
                  Register here
                </Link>
              </p>
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
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
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

                <form onSubmit={handleSubmit(onSave)} className="space-y-4">
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
                className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
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
                      setUser(null);
                      setOrders([]);
                      useUserStore.getState().clearEmail();
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
            className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-6"
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
                      className={inputClass(false) + " pr-10"}
                    />
                    <button type="button" onClick={() => setShowCurrentPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400/50 hover:text-green-400">
                      {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
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
                      className={inputClass(false) + " pr-10"}
                    />
                    <button type="button" onClick={() => setShowNewPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400/50 hover:text-green-400">
                      {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
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

        {/* ── Order History ─────────────────────────────────── */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <ShoppingBag size={18} className="text-green-400" />
              My Orders
            </h2>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-12 text-green-400/40">
                <Loader2 size={20} className="animate-spin mr-2" />
                Loading orders…
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-12 text-center bg-white/5 border border-white/10 rounded-2xl">
                <PackageOpen size={40} className="text-green-400/20" />
                <p className="text-green-200/40 text-sm">No orders yet. Start shopping!</p>
                <Link href="/">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="px-5 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium"
                  >
                    Explore Plants
                  </motion.div>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const style = STATUS_STYLES[order.status];
                  const StatusIcon = style.icon;
                  const isExpanded = expandedOrder === order._id;
                  return (
                    <motion.div
                      key={order._id}
                      layout
                      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                    >
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer"
                        onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border font-medium ${style.bg}`}>
                              <StatusIcon size={10} />
                              {style.label}
                            </span>
                            {order.status === "accepted" && (
                              <span className={`text-xs font-medium ${DELIVERY_LABELS[order.deliveryStatus]?.color ?? "text-zinc-400"}`}>
                                🚚 {DELIVERY_LABELS[order.deliveryStatus]?.label ?? order.deliveryStatus}
                              </span>
                            )}
                            <span className="text-white font-semibold text-sm">₹{order.total}</span>
                            <span className="text-green-200/40 text-xs">
                              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <p className="text-green-200/40 text-xs mt-1">
                            {new Date(order.createdAt).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="text-green-200/40 ml-3">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-white/10 px-4 pb-4 pt-3 space-y-1"
                          >
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-xs">
                                <span className="text-white/70">{item.emoji} {item.name} ×{item.quantity}</span>
                                <span className="text-green-400">₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                            <div className="flex justify-between text-xs pt-1 border-t border-white/10">
                              <span className="text-green-200/40">Delivery</span>
                              <span className="text-white/50">{order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}</span>
                            </div>
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-white">Total</span>
                              <span className="text-green-400">₹{order.total}</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>

      <Footer minimal />
    </main>
  );
}
