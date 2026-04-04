"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Clock, CreditCard, PackageOpen, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getPaymentBadgeLabel, type OrderPaymentSummary } from "@/lib/payment";

interface OrderItem {
  id: string;
  name: string;
  emoji: string;
  categoryName: string;
  price: number;
  quantity: number;
}

export interface ProfileOrder extends OrderPaymentSummary {
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
  not_shipped: { label: "Not Shipped", color: "text-zinc-400" },
  shipped: { label: "Shipped", color: "text-blue-400" },
  out_for_delivery: { label: "Out for Delivery", color: "text-orange-400" },
  delivered: { label: "Delivered", color: "text-green-400" },
};

const STATUS_STYLES = {
  pending: { bg: "bg-yellow-500/15 border-yellow-500/30 text-yellow-400", icon: Clock, label: "Pending" },
  accepted: { bg: "bg-green-500/15 border-green-500/30 text-green-400", icon: CheckCircle, label: "Accepted" },
  declined: { bg: "bg-red-500/15 border-red-500/30 text-red-400", icon: XCircle, label: "Declined" },
};

const PAYMENT_STYLES = {
  paid: "bg-green-500/15 border-green-500/30 text-green-300",
  mock_paid: "bg-sky-500/15 border-sky-500/30 text-sky-300",
  not_recorded: "bg-zinc-500/15 border-zinc-500/25 text-zinc-300",
};

export default function OrdersList({ orders, loading }: { orders: ProfileOrder[]; loading: boolean }) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-[28px] border border-white/10 bg-white/5 px-6 py-12 text-green-300/60">
        <Loader2 size={18} className="mr-2 animate-spin" />
        Loading orders…
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[28px] border border-white/10 bg-white/5 px-6 py-14 text-center">
        <PackageOpen size={44} className="text-green-400/20" />
        <div>
          <p className="text-lg font-semibold text-white">No orders yet</p>
          <p className="mt-2 text-sm text-green-100/45">Start with a plant you want to keep for the long term.</p>
        </div>
        <Link href="/search?q=plant">
          <span className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/12 px-5 py-2 text-sm font-medium text-green-300 transition hover:border-green-400/40 hover:text-white">
            Explore Plants
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const style = STATUS_STYLES[order.status];
        const StatusIcon = style.icon;
        const isExpanded = expandedOrder === order._id;

        return (
          <motion.div key={order._id} layout className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.045] shadow-[0_14px_48px_rgba(0,0,0,0.2)]">
            <div className="flex cursor-pointer items-center justify-between gap-4 p-5" onClick={() => setExpandedOrder(isExpanded ? null : order._id)}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.bg}`}>
                    <StatusIcon size={10} />
                    {style.label}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${PAYMENT_STYLES[order.paymentStatus]}`}>
                    <CreditCard size={10} />
                    {getPaymentBadgeLabel(order)}
                  </span>
                  {order.status === "accepted" && (
                    <span className={`text-xs font-medium ${DELIVERY_LABELS[order.deliveryStatus]?.color ?? "text-zinc-400"}`}>
                      {DELIVERY_LABELS[order.deliveryStatus]?.label ?? order.deliveryStatus}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="text-lg font-semibold text-white">₹{order.total}</span>
                  <span className="text-sm text-green-100/45">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs text-green-100/40">{new Date(order.createdAt).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="text-green-100/40">{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden border-t border-white/10 px-5 pb-5 pt-4"
                >
                  <div className="space-y-2 text-sm">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between gap-4">
                        <span className="text-white/80">{item.emoji} {item.name} ×{item.quantity}</span>
                        <span className="text-green-300">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
                    <div className="flex justify-between text-green-100/45">
                      <span>Delivery</span>
                      <span>{order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-white">
                      <span>Total</span>
                      <span className="text-green-300">₹{order.total}</span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-green-100/45">Payment</span>
                      <span className="text-white/80">{order.paymentMethodLabel}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-4">
                      <span className="text-green-100/45">Reference</span>
                      <span className="truncate text-white/60">{order.paymentReference ?? "Not recorded"}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-4">
                      <span className="text-green-100/45">Paid at</span>
                      <span className="text-white/60">{order.paidAt ? new Date(order.paidAt).toLocaleString("en-IN") : "Not recorded"}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}