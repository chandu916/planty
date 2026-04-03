export type PaymentProvider = "mock" | "razorpay";
export type StoredPaymentProvider = PaymentProvider | "legacy";
export type StoredPaymentStatus = OrderPaymentPayload["status"] | "not_recorded";

export type OrderPaymentPayload = {
  provider: PaymentProvider;
  status: "mock_paid" | "paid";
  reference: string;
  methodLabel: string;
  paymentId?: string;
  orderId?: string;
  signature?: string;
};

export type OrderPaymentSummary = {
  paymentProvider: StoredPaymentProvider;
  paymentStatus: StoredPaymentStatus;
  paymentMethodLabel: string;
  paymentReference: string | null;
  paidAt: string | null;
};

type OrderPaymentSummaryInput = {
  paymentProvider?: string | null;
  paymentStatus?: string | null;
  paymentMethodLabel?: string | null;
  paymentReference?: string | null;
  paidAt?: string | null;
};

export type CheckoutSession = {
  provider: PaymentProvider;
  sessionId: string;
  amount: number;
  currency: "INR";
  displayAmount: string;
  merchantName: string;
  description: string;
  instructions?: string;
  customer: {
    name: string;
    email: string;
    contact: string;
  };
  keyId?: string;
  orderId?: string;
};

export type CheckoutSessionResponse =
  | { success: true; checkout: CheckoutSession }
  | { success: false; message: string };

export type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler: (response: RazorpaySuccessResponse) => void;
};

export function normalizeOrderPaymentSummary(
  value: OrderPaymentSummaryInput,
): OrderPaymentSummary {
  const paymentProvider: StoredPaymentProvider =
    value.paymentProvider === "mock" || value.paymentProvider === "razorpay"
      ? value.paymentProvider
      : "legacy";

  const paymentStatus: StoredPaymentStatus =
    value.paymentStatus === "paid" || value.paymentStatus === "mock_paid"
      ? value.paymentStatus
      : "not_recorded";

  const defaultMethodLabel =
    paymentProvider === "razorpay"
      ? "Razorpay Test Checkout"
      : paymentProvider === "mock"
        ? "Mock Payment"
        : "Not recorded";

  return {
    paymentProvider,
    paymentStatus,
    paymentMethodLabel:
      typeof value.paymentMethodLabel === "string" && value.paymentMethodLabel.trim().length > 0
        ? value.paymentMethodLabel
        : defaultMethodLabel,
    paymentReference:
      typeof value.paymentReference === "string" && value.paymentReference.trim().length > 0
        ? value.paymentReference
        : null,
    paidAt:
      typeof value.paidAt === "string" && value.paidAt.trim().length > 0
        ? value.paidAt
        : null,
  };
}

export function getPaymentBadgeLabel(summary: Pick<OrderPaymentSummary, "paymentProvider" | "paymentStatus">) {
  if (summary.paymentStatus === "mock_paid") return "Mock Paid";
  if (summary.paymentStatus === "paid") {
    return summary.paymentProvider === "razorpay" ? "Paid Online" : "Paid";
  }
  return "Payment Unrecorded";
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => {
      open: () => void;
      on?: (event: string, callback: (response: unknown) => void) => void;
    };
  }
}