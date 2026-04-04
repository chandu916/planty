"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock3, Package2, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useUserStore } from "@/lib/userStore";
import AccountShell from "@/app/profile/components/AccountShell";
import OrdersList, { type ProfileOrder } from "@/app/profile/components/OrdersList";

type ProfileInitialUser = {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export default function OrdersPageClient({ initialUser }: { initialUser: ProfileInitialUser }) {
  const login = useUserStore((state) => state.login);
  const [orders, setOrders] = useState<ProfileOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    login(initialUser);
  }, [initialUser, login]);

  useEffect(() => {
    let cancelled = false;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/orders", { cache: "no-store" });
        const json = await response.json();
        if (!cancelled && json.success) {
          setOrders(json.orders);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const totalSpend = orders.reduce((sum, order) => sum + order.total, 0);
    const activeOrders = orders.filter((order) => order.status === "pending").length;
    const deliveredOrders = orders.filter((order) => order.deliveryStatus === "delivered").length;
    const paidOrders = orders.filter((order) => order.paymentStatus === "paid" || order.paymentStatus === "mock_paid").length;

    return { totalSpend, activeOrders, deliveredOrders, paidOrders };
  }, [orders]);

  return (
    <AccountShell
      title="Orders"
      description="Track every order, review payment receipts, and keep an eye on deliveries without jumping between screens."
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total Orders", value: orders.length, icon: Package2, tone: "text-green-300" },
            { label: "Active Orders", value: stats.activeOrders, icon: Clock3, tone: "text-amber-300" },
            { label: "Delivered", value: stats.deliveredOrders, icon: CheckCircle2, tone: "text-sky-300" },
            { label: "Total Spend", value: `₹${stats.totalSpend}`, icon: Wallet, tone: "text-emerald-300" },
          ].map(({ label, value, icon: Icon, tone }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[26px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.2)]"
            >
              <div className={`inline-flex rounded-full border border-white/10 bg-black/20 p-2 ${tone}`}>
                <Icon size={16} />
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.22em] text-green-100/35">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            </motion.div>
          ))}
        </div>

        <OrdersList orders={orders} loading={loading} />
      </div>
    </AccountShell>
  );
}