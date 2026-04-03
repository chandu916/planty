"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, Leaf, CheckCircle, AlertCircle, Loader2, CreditCard, ShieldCheck, Smartphone, X } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";
import type { CheckoutSession, OrderPaymentPayload, RazorpaySuccessResponse } from "@/lib/payment";
import { useUserStore } from "@/lib/userStore";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import BackButton from "@/app/components/BackButton";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const DELIVERY_FEE = 99;
const FREE_DELIVERY_THRESHOLD = 999;
const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

type MockPaymentMethod = "upi" | "card" | "bank";

const PAYMENT_METHODS: Array<{
  id: MockPaymentMethod;
  label: string;
  hint: string;
  icon: typeof Smartphone;
}> = [
  { id: "upi", label: "UPI", hint: "Fastest for test checkout", icon: Smartphone },
  { id: "card", label: "Card", hint: "Visa / Mastercard test flow", icon: CreditCard },
  { id: "bank", label: "Net Banking", hint: "Mock bank redirect", icon: ShieldCheck },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function loadExternalScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CartPageClient() {
  const { items, removeItem, updateQuantity, clearCart, loadItems } = useCartStore();
  const { isLoggedIn, user } = useUserStore();
  const [checkedOut, setCheckedOut] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [openingPayment, setOpeningPayment] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);
  const [paymentSession, setPaymentSession] = useState<CheckoutSession | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<MockPaymentMethod>("upi");
  const [orderError, setOrderError] = useState("");
  const cartLoadedRef = useRef(false);

  const userEmail = isLoggedIn ? user?.email ?? null : null;

  // Load saved cart from DB when user is logged in (runs once on mount)
  useEffect(() => {
    if (!userEmail || cartLoadedRef.current) return;
    cartLoadedRef.current = true;
    fetch(`/api/cart?email=${encodeURIComponent(userEmail)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.items?.length > 0) {
          // Merge: keep local items, overlay server items for any that aren't already in cart
          const localIds = new Set(useCartStore.getState().items.map((i) => i.id));
          const newItems = json.items.filter((i: { id: string }) => !localIds.has(i.id));
          if (newItems.length > 0) {
            loadItems([...useCartStore.getState().items, ...newItems]);
          }
        }
      })
      .catch(() => {/* silent — cart still works from localStorage */});
  }, [userEmail, loadItems]);

  // Auto-save cart to DB whenever items change (debounced 800ms)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!userEmail) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, items: useCartStore.getState().items }),
      }).catch(() => {/* silent */});
    }, 800);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [items, userEmail]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;
  const checkoutBusy = openingPayment || processingPayment || placing;

  const openMockPaymentSheet = (checkout: CheckoutSession, message?: string) => {
    setPaymentSession({
      ...checkout,
      provider: "mock",
      sessionId: `mock_${Date.now()}`,
      keyId: undefined,
      orderId: undefined,
      instructions: message ?? checkout.instructions,
    });
    setPaymentMethod("upi");
    setPaymentSheetOpen(true);
  };

  const finalizeOrder = async (payment: OrderPaymentPayload) => {
    if (!userEmail) {
      setOrderError("Please log in or register before placing an order.");
      return;
    }

    setPlacing(true);
    setOrderError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, items, subtotal, deliveryFee, total, payment }),
      });
      const json = await res.json();
      if (json.success) {
        setPaymentSheetOpen(false);
        setPaymentSession(null);
        setOrderId(json.orderId);
        setCheckedOut(true);
        clearCart();
        fetch(`/api/cart?email=${encodeURIComponent(userEmail)}`, { method: "DELETE" })
          .catch(() => {/* silent */});
      } else {
        setOrderError(json.message || "Failed to place order. Please try again.");
      }
    } catch {
      setOrderError("Network error. Please try again.");
    } finally {
      setPlacing(false);
      setProcessingPayment(false);
    }
  };

  const launchRazorpayCheckout = async (checkout: CheckoutSession) => {
    if (!checkout.keyId || !checkout.orderId) return false;

    const loaded = await loadExternalScript(RAZORPAY_SCRIPT);
    if (!loaded || !window.Razorpay) return false;

    const razorpay = new window.Razorpay({
      key: checkout.keyId,
      amount: checkout.amount,
      currency: checkout.currency,
      name: checkout.merchantName,
      description: checkout.description,
      order_id: checkout.orderId,
      prefill: {
        name: checkout.customer.name,
        email: checkout.customer.email,
        contact: checkout.customer.contact,
      },
      theme: { color: "#22c55e" },
      modal: {
        ondismiss: () => {
          setOrderError("Payment was cancelled before the order was placed.");
        },
      },
      handler: (response: RazorpaySuccessResponse) => {
        void finalizeOrder({
          provider: "razorpay",
          status: "paid",
          reference: response.razorpay_payment_id,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
          methodLabel: "Razorpay Test Checkout",
        });
      },
    });

    razorpay.on?.("payment.failed", () => {
      setOrderError("Payment failed. Please try again.");
    });

    razorpay.open();
    return true;
  };

  const handleCheckout = async () => {
    if (!userEmail) {
      setOrderError("Please log in or register before placing an order.");
      return;
    }

    if (items.length === 0) {
      setOrderError("Your cart is empty.");
      return;
    }

    setOpeningPayment(true);
    setOrderError("");

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, items, subtotal, deliveryFee, total }),
      });
      const json = await res.json();

      if (json.success && json.checkout) {
        const checkout = json.checkout as CheckoutSession;
        if (checkout.provider === "razorpay") {
          const opened = await launchRazorpayCheckout(checkout);
          if (!opened) {
            openMockPaymentSheet(
              checkout,
              "Razorpay test checkout is unavailable right now, so mock payment mode is active."
            );
          }
        } else {
          openMockPaymentSheet(checkout);
        }
      } else {
        setOrderError(json.message || "Unable to start payment. Please try again.");
      }
    } catch {
      setOrderError("Unable to start payment. Please try again.");
    } finally {
      setOpeningPayment(false);
    }
  };

  const handleMockPayment = async () => {
    if (!paymentSession) return;

    setProcessingPayment(true);
    await wait(900);
    await finalizeOrder({
      provider: "mock",
      status: "mock_paid",
      reference: `mockpay_${Date.now()}`,
      methodLabel: PAYMENT_METHODS.find((method) => method.id === paymentMethod)?.label ?? "Mock Payment",
    });
  };

  return (
    <main className="flex flex-col min-h-screen bg-transparent">
      <Navbar />

      <div className="flex-1 pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <BackButton fallbackHref="/" label="Back" className="mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
            <ShoppingBag className="text-green-400" size={32} />
            Your Cart
            {items.length > 0 && (
              <span className="text-lg text-green-400/70 font-normal">
                ({items.reduce((s, i) => s + i.quantity, 0)} items)
              </span>
            )}
          </h1>
        </motion.div>

        <AnimatePresence mode="wait">
          {checkedOut ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6 py-24 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="text-green-400"
              >
                <CheckCircle size={80} />
              </motion.div>
              <h2 className="text-3xl font-bold text-white">Order Placed! 🌿</h2>
              <p className="text-green-200/60 max-w-md">
                Thank you for your order. Your plants are being carefully packaged and
                will be delivered soon.
              </p>
              {orderId && (
                <p className="text-xs text-green-400/50 font-mono">Order ID: {orderId}</p>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 rounded-full bg-green-500 hover:bg-green-400 text-black font-bold transition-colors"
                  >
                    Back to Home
                  </motion.div>
                </Link>
                <Link href="/profile">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors border border-white/20"
                  >
                    View Orders
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          ) : items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-6 py-24 text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-7xl"
              >
                🛒
              </motion.div>
              <h2 className="text-2xl font-bold text-white">Your cart is empty</h2>
              <p className="text-green-200/50">Add some plants to get started!</p>
              <Link href="/">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 font-semibold transition-colors hover:bg-green-500 hover:text-black"
                >
                  <Leaf size={16} />
                  Explore Plants
                </motion.div>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="cart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* LEFT — Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="group relative flex items-center gap-4 bg-white/5 border border-white/10 hover:border-green-400/30 rounded-2xl p-4 sm:p-5 transition-colors"
                    >
                      {/* Emoji thumbnail */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl bg-gradient-to-br from-green-900/50 to-emerald-800/30 flex items-center justify-center text-3xl">
                        {item.emoji}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-green-400/60 mb-0.5">{item.categoryName}</p>
                        <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                          {item.name}
                        </h3>
                        <p className="text-green-300 font-bold mt-1">₹{item.price}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <motion.button
                          data-sound="count-down"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full border border-green-500/30 flex items-center justify-center text-green-400 hover:bg-green-500 hover:text-black hover:border-green-500 transition-all"
                        >
                          <Minus size={12} />
                        </motion.button>
                        <span className="text-white font-medium w-6 text-center text-sm">
                          {item.quantity}
                        </span>
                        <motion.button
                          data-sound="count-up"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full border border-green-500/30 flex items-center justify-center text-green-400 hover:bg-green-500 hover:text-black hover:border-green-500 transition-all"
                        >
                          <Plus size={12} />
                        </motion.button>
                      </div>

                      {/* Line Total */}
                      <div className="text-right min-w-[70px]">
                        <p className="text-green-300 font-bold">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>

                      {/* Remove */}
                      <motion.button
                        data-sound="delete"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeItem(item.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* RIGHT — Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="sticky top-24 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
                >
                  <h2 className="text-lg font-bold text-white border-b border-white/10 pb-4">
                    Order Summary
                  </h2>

                  {/* Item list */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-green-200/60 truncate flex-1 mr-2">
                          {item.emoji} {item.name}{" "}
                          <span className="text-green-400/50">×{item.quantity}</span>
                        </span>
                        <span className="text-white font-medium flex-shrink-0">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-white/10 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-200/60">Subtotal</span>
                      <span className="text-white">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-200/60">Delivery</span>
                      <span
                        className={
                          deliveryFee === 0 ? "text-green-400 font-medium" : "text-white"
                        }
                      >
                        {deliveryFee === 0 ? "FREE 🎉" : `₹${deliveryFee}`}
                      </span>
                    </div>
                    {deliveryFee > 0 && (
                      <p className="text-xs text-green-400/50">
                        Add ₹{FREE_DELIVERY_THRESHOLD - subtotal} more for free delivery
                      </p>
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-white font-bold text-lg">Total</span>
                      <span className="text-green-400 font-bold text-2xl">₹{total}</span>
                    </div>

                    {orderError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-red-400 text-xs p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4"
                      >
                        <AlertCircle size={13} />
                        {orderError}
                      </motion.div>
                    )}

                    <motion.button
                      onClick={handleCheckout}
                      disabled={checkoutBusy}
                      whileHover={checkoutBusy ? {} : {
                        scale: 1.03,
                        boxShadow: "0 0 30px rgba(74,222,128,0.4)",
                      }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-400 disabled:opacity-60 text-black font-bold text-base transition-colors shadow-xl shadow-green-500/20 flex items-center justify-center gap-2"
                    >
                      {openingPayment ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Opening Payment…
                        </>
                      ) : processingPayment ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Processing Payment…
                        </>
                      ) : placing ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Placing Order…
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Place Order
                        </>
                      )}
                    </motion.button>

                    <p className="text-center text-xs text-green-200/30 mt-3">
                      🔒 Secure checkout · Free returns
                    </p>
                  </div>
                </motion.div>
              </div>

              <PaymentSheet
                open={paymentSheetOpen}
                session={paymentSession}
                method={paymentMethod}
                busy={processingPayment || placing}
                onClose={() => {
                  if (processingPayment || placing) return;
                  setPaymentSheetOpen(false);
                }}
                onMethodChange={setPaymentMethod}
                onConfirm={handleMockPayment}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer minimal />
    </main>
  );
}

function PaymentSheet({
  open,
  session,
  method,
  busy,
  onClose,
  onMethodChange,
  onConfirm,
}: {
  open: boolean;
  session: CheckoutSession | null;
  method: MockPaymentMethod;
  busy: boolean;
  onClose: () => void;
  onMethodChange: (method: MockPaymentMethod) => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {open && session && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 px-3 pb-3 pt-6 backdrop-blur-sm sm:items-center sm:p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="flex w-full max-w-lg max-h-[calc(100dvh-0.75rem)] flex-col overflow-hidden rounded-[1.75rem] border border-white/12 bg-[linear-gradient(180deg,rgba(12,32,20,0.96),rgba(5,14,10,0.98))] shadow-2xl shadow-green-950/50 sm:max-h-[min(760px,calc(100dvh-2rem))] sm:rounded-[2rem]"
          >
            <div className="border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 inline-flex max-w-full rounded-full border border-green-400/20 bg-green-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-green-300 sm:text-[11px] sm:tracking-[0.18em]">
                    {session.provider === "razorpay" ? "Razorpay Test Mode" : "Mock Checkout"}
                  </div>
                  <h3 className="text-xl font-bold text-white sm:text-2xl">Complete Payment</h3>
                  <p className="mt-1 text-sm leading-relaxed text-green-200/60">{session.instructions ?? session.description}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={busy}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-green-200/70 transition hover:border-red-400/30 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close payment sheet"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="rounded-3xl border border-green-400/15 bg-green-500/8 p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.16em] text-green-300/50">Amount to pay</p>
                      <p className="mt-2 text-3xl font-black text-white sm:text-4xl">{session.displayAmount}</p>
                      <p className="mt-2 break-words text-sm text-green-200/60">{session.customer.name} · {session.customer.email}</p>
                    </div>
                    <div className="w-fit rounded-2xl border border-green-400/15 bg-black/20 px-3 py-2 text-left sm:text-right">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-green-300/50">Currency</p>
                      <p className="mt-1 text-lg font-semibold text-green-300">{session.currency}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.16em] text-green-300/50">Choose a method</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {PAYMENT_METHODS.map((option) => {
                      const Icon = option.icon;
                      const selected = option.id === method;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => onMethodChange(option.id)}
                          className={[
                            "rounded-2xl border px-4 py-4 text-left transition",
                            selected
                              ? "border-green-400 bg-green-500/12 text-white shadow-lg shadow-green-900/20"
                              : "border-white/10 bg-white/5 text-green-200/70 hover:border-green-400/30 hover:bg-white/8",
                          ].join(" ")}
                        >
                          <Icon size={18} className={selected ? "text-green-300" : "text-green-400/70"} />
                          <p className="mt-3 text-sm font-semibold">{option.label}</p>
                          <p className="mt-1 text-xs leading-relaxed text-inherit/70">{option.hint}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-green-100/75">
                  <p className="font-medium text-white">What happens next</p>
                  <p className="mt-2 leading-relaxed">
                    This free checkout flow opens before the order is created. In mock mode, payment is simulated safely for development. If Razorpay test keys are configured later, this switches to the hosted Razorpay test popup automatically.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={busy}
                  className="flex-1 rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  type="button"
                  onClick={onConfirm}
                  disabled={busy}
                  whileHover={busy ? {} : { scale: 1.01 }}
                  whileTap={busy ? {} : { scale: 0.98 }}
                  className="flex-1 rounded-2xl bg-green-500 px-5 py-3 text-sm font-bold text-black shadow-xl shadow-green-500/20 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Processing…
                    </span>
                  ) : (
                    `Pay ${session.displayAmount}`
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
