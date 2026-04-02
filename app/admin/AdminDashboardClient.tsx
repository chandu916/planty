"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ShoppingBag,
  LogOut,
  Check,
  X,
  Search,
  Download,
  Leaf,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  PackageOpen,
  ChevronDown,
  ChevronUp,
  Truck,
  Package,
} from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/lib/adminStore";
import BackButton from "@/app/components/BackButton";

interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
}

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
  userEmail: string;
  userName: string;
  userPhone: string;
  userAddress: string;
  userCity: string;
  userState: string;
  userPincode: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: "pending" | "accepted" | "declined";
  deliveryStatus: "not_shipped" | "shipped" | "out_for_delivery" | "delivered";
  createdAt: string;
  updatedAt: string;
}

type Tab = "orders" | "users";

const STATUS_STYLES = {
  pending:  { bg: "bg-yellow-500/15 border-yellow-500/30 text-yellow-400", icon: Clock },
  accepted: { bg: "bg-green-500/15 border-green-500/30 text-green-400",   icon: CheckCircle },
  declined: { bg: "bg-red-500/15 border-red-500/30 text-red-400",         icon: XCircle },
};

const DELIVERY_STYLES: Record<string, { bg: string; label: string }> = {
  not_shipped:      { bg: "bg-zinc-500/20 border-zinc-500/30 text-zinc-400",   label: "Not Shipped" },
  shipped:          { bg: "bg-blue-500/15 border-blue-500/30 text-blue-400",   label: "Shipped" },
  out_for_delivery: { bg: "bg-orange-500/15 border-orange-500/30 text-orange-400", label: "Out for Delivery" },
  delivered:        { bg: "bg-green-500/15 border-green-500/30 text-green-400", label: "Delivered" },
};

const DELIVERY_STEPS: Array<{ value: string; label: string }> = [
  { value: "not_shipped",      label: "Not Shipped" },
  { value: "shipped",          label: "Shipped" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered",        label: "Delivered" },
];

export default function AdminDashboardClient({ initialUsers }: { initialUsers: AdminUser[] }) {
  const router = useRouter();
  const { isLoggedIn, admin, logout } = useAdminStore();

  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "declined">("all");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/admin/login");
    }
  }, [isLoggedIn, router]);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const json = await res.json();
      if (json.success) setOrders(json.orders);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchOrders();
  }, [isLoggedIn, fetchOrders]);

  const handleUpdateStatus = async (
    orderId: string,
    update: { status?: "accepted" | "declined"; deliveryStatus?: string }
  ) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      const json = await res.json();
      if (json.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId
              ? { ...o, ...update, updatedAt: new Date().toISOString() } as Order
              : o
          )
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        !orderSearch ||
        o.userName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.userEmail.toLowerCase().includes(orderSearch.toLowerCase());
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, statusFilter]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    if (!q) return initialUsers;
    return initialUsers.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        u.state.toLowerCase().includes(q) ||
        u.phone.includes(q)
    );
  }, [initialUsers, userSearch]);

  const downloadCSV = () => {
    const headers = ["ID", "Full Name", "Email", "Phone", "Address", "City", "State", "Pincode", "Registered At"];
    const rows = initialUsers.map((u) => [
      u._id, `"${u.fullName}"`, u.email, u.phone, `"${u.address}"`,
      u.city, u.state, u.pincode, new Date(u.createdAt).toLocaleString("en-IN"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `planty-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Order stats
  const pendingCount  = orders.filter((o) => o.status === "pending").length;
  const acceptedCount = orders.filter((o) => o.status === "accepted").length;
  const declinedCount = orders.filter((o) => o.status === "declined").length;

  if (!isLoggedIn) return null;

  return (
    <main className="min-h-screen bg-transparent text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌿</span>
            <div>
              <p className="font-bold text-white leading-none">Planty Admin</p>
              <p className="text-green-400/60 text-xs mt-0.5">{admin?.name} · {admin?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-green-200/50 hover:text-red-400 transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <BackButton fallbackHref="/" label="Back" className="mb-6" />

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Orders", value: orders.length, color: "text-white",        bg: "from-white/5 to-white/5" },
            { label: "Pending",      value: pendingCount,  color: "text-yellow-400",   bg: "from-yellow-500/10 to-yellow-600/5" },
            { label: "Accepted",     value: acceptedCount, color: "text-green-400",    bg: "from-green-500/10 to-green-600/5" },
            { label: "Users",        value: initialUsers.length, color: "text-blue-400", bg: "from-blue-500/10 to-blue-600/5" },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gradient-to-br ${s.bg} border border-white/10 rounded-2xl p-4`}
            >
              <p className="text-green-200/50 text-xs mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          {(["orders", "users"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all capitalize ${
                tab === t
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-green-200/40 hover:text-green-200/70"
              }`}
            >
              {t === "orders" ? <ShoppingBag size={15} /> : <Users size={15} />}
              {t}
              {t === "orders" && pendingCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-400 font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {tab === "orders" && (
          <div>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-400/50" />
                <input
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by name or email…"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-green-200/30 focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20"
                />
              </div>
              <div className="flex gap-2">
                {(["all", "pending", "accepted", "declined"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                      statusFilter === s
                        ? s === "pending"   ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        : s === "accepted"  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : s === "declined"  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-white/10 text-white border border-white/20"
                        : "bg-white/5 text-green-200/40 border border-white/10 hover:text-green-200/70"
                    }`}
                  >
                    {s}
                  </button>
                ))}
                <button
                  onClick={fetchOrders}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-green-400/50 hover:text-green-400 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="text-green-400/50 flex items-center gap-3">
                  <RefreshCw size={20} className="animate-spin" />
                  Loading orders…
                </div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-24 text-center">
                <PackageOpen size={48} className="text-green-400/20" />
                <p className="text-green-200/40">No orders found</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredOrders.map((order) => {
                    const style = STATUS_STYLES[order.status];
                    const StatusIcon = style.icon;
                    const isExpanded = expandedOrder === order._id;

                    return (
                      <motion.div
                        key={order._id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                      >
                        {/* Order header */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-white">{order.userName}</p>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${style.bg}`}>
                                <StatusIcon size={10} />
                                {order.status}
                              </span>
                              {order.status === "accepted" && (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${DELIVERY_STYLES[order.deliveryStatus]?.bg ?? ""}`}>
                                  <Package size={10} />
                                  {DELIVERY_STYLES[order.deliveryStatus]?.label ?? order.deliveryStatus}
                                </span>
                              )}
                            </div>
                            <p className="text-green-200/50 text-xs mt-0.5">{order.userEmail}</p>
                            <p className="text-green-200/40 text-xs">
                              {order.items.length} item{order.items.length !== 1 ? "s" : ""} · ₹{order.total}
                              {order.deliveryFee === 0 && <span className="text-green-400/60"> · Free delivery</span>}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Accept / Decline buttons only for pending */}
                            {order.status === "pending" && (
                              <>
                                <motion.button
                                  onClick={() => handleUpdateStatus(order._id, { status: "accepted" })}
                                  disabled={updatingId === order._id}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/20 hover:bg-green-500/40 border border-green-500/30 text-green-400 text-xs font-semibold transition-all disabled:opacity-50"
                                >
                                  <Check size={12} />
                                  Accept
                                </motion.button>
                                <motion.button
                                  onClick={() => handleUpdateStatus(order._id, { status: "declined" })}
                                  disabled={updatingId === order._id}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-400 text-xs font-semibold transition-all disabled:opacity-50"
                                >
                                  <X size={12} />
                                  Decline
                                </motion.button>
                              </>
                            )}

                            {/* Delivery status selector — only for accepted orders */}
                            {order.status === "accepted" && (
                              <div className="flex items-center gap-1.5">
                                <Truck size={12} className="text-blue-400/60 flex-shrink-0" />
                                <select
                                  value={order.deliveryStatus}
                                  disabled={updatingId === order._id}
                                  onChange={(e) =>
                                    handleUpdateStatus(order._id, {
                                      deliveryStatus: e.target.value,
                                    })
                                  }
                                  className="bg-white/5 border border-white/15 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-400/50 disabled:opacity-50 cursor-pointer"
                                >
                                  {DELIVERY_STEPS.map((s) => (
                                    <option key={s.value} value={s.value} className="bg-zinc-900">
                                      {s.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Expand toggle */}
                            <button
                              onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-green-200/40 hover:text-green-200/70 transition-all"
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Expanded details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden border-t border-white/10"
                            >
                              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                {/* Address */}
                                <div>
                                  <p className="text-green-200/40 text-xs mb-2 flex items-center gap-1">
                                    <MapPin size={11} /> Delivery Address
                                  </p>
                                  <p className="text-white/80 text-xs leading-relaxed">
                                    {order.userAddress}, {order.userCity}, {order.userState} – {order.userPincode}
                                  </p>
                                  <p className="text-green-200/50 text-xs mt-1 flex items-center gap-1">
                                    <Phone size={10} /> {order.userPhone}
                                  </p>
                                </div>

                                {/* Items */}
                                <div>
                                  <p className="text-green-200/40 text-xs mb-2 flex items-center gap-1">
                                    <ShoppingBag size={11} /> Items
                                  </p>
                                  <div className="space-y-1">
                                    {order.items.map((item) => (
                                      <div key={item.id} className="flex justify-between text-xs">
                                        <span className="text-white/70">
                                          {item.emoji} {item.name} ×{item.quantity}
                                        </span>
                                        <span className="text-green-400">₹{item.price * item.quantity}</span>
                                      </div>
                                    ))}
                                    <div className="flex justify-between text-xs pt-1 border-t border-white/10">
                                      <span className="text-green-200/40">Delivery</span>
                                      <span className="text-white/60">
                                        {order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs font-semibold">
                                      <span className="text-white">Total</span>
                                      <span className="text-green-400">₹{order.total}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="px-4 pb-3 text-xs text-green-200/30">
                                Ordered: {new Date(order.createdAt).toLocaleString("en-IN")}
                                {order.status !== "pending" && ` · Updated: ${new Date(order.updatedAt).toLocaleString("en-IN")}`}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <div>
            {/* Search + CSV */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-400/50" />
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search name, email, city…"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-green-200/30 focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20"
                />
              </div>
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/25 transition-colors"
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-24 text-center">
                <Users size={48} className="text-green-400/20" />
                <p className="text-green-200/40">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      {["Name", "Email", "Phone", "City / State", "Joined"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-green-200/50 font-medium text-xs whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-xs flex-shrink-0">
                              {u.fullName[0].toUpperCase()}
                            </div>
                            <span className="text-white font-medium">{u.fullName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-green-200/60 flex items-center gap-1">
                            <Mail size={11} className="flex-shrink-0" />
                            {u.email}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-green-200/60 flex items-center gap-1">
                            <Phone size={11} className="flex-shrink-0" />
                            {u.phone}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-green-200/60 flex items-center gap-1">
                            <MapPin size={11} className="flex-shrink-0" />
                            {u.city}, {u.state}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-green-200/40 flex items-center gap-1 text-xs whitespace-nowrap">
                            <Calendar size={10} className="flex-shrink-0" />
                            {new Date(u.createdAt).toLocaleDateString("en-IN")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
