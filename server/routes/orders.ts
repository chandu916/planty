/**
 * server/routes/orders.ts
 * POST /api/orders  — place an order
 * GET  /api/orders  — get orders for a user (by email)
 */
import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { z } from "zod";
import { requireUserSessionFromRequest } from "@/server/auth/guards";
import { getDb } from "@/server/db/connection";
import { normalizeOrderPaymentSummary } from "@/lib/payment";

const orderItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  emoji: z.string(),
  categoryName: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
});

const paymentSchema = z.object({
  provider: z.enum(["mock", "razorpay"]),
  status: z.enum(["mock_paid", "paid"]),
  reference: z.string().min(6),
  methodLabel: z.string().min(2),
  paymentId: z.string().optional(),
  orderId: z.string().optional(),
  signature: z.string().optional(),
});

const placeOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Cart is empty"),
  subtotal: z.number().nonnegative(),
  deliveryFee: z.number().nonnegative(),
  total: z.number().positive(),
  payment: paymentSchema,
});

export async function handlePlaceOrder(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireUserSessionFromRequest(request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const parsed = placeOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { items, subtotal, deliveryFee, total, payment } = parsed.data;
    const userEmail = auth.session.user.email;

    if (payment.provider === "razorpay") {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret || !payment.orderId || !payment.paymentId || !payment.signature) {
        return NextResponse.json(
          { success: false, message: "Payment verification details are incomplete." },
          { status: 400 }
        );
      }

      const expectedSignature = createHmac("sha256", secret)
        .update(`${payment.orderId}|${payment.paymentId}`)
        .digest("hex");

      if (expectedSignature !== payment.signature) {
        return NextResponse.json(
          { success: false, message: "Payment verification failed. Order was not created." },
          { status: 400 }
        );
      }
    }

    if (payment.provider === "mock" && !payment.reference.startsWith("mockpay_")) {
      return NextResponse.json(
        { success: false, message: "Mock payment is invalid. Please retry checkout." },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Fetch user details for denormalized storage
    const user = await db.collection("users").findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found. Please log in and try again." },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();
    const result = await db.collection("orders").insertOne({
      userEmail,
      userName: user.fullName as string,
      userPhone: user.phone as string,
      userAddress: user.address as string,
      userCity: user.city as string,
      userState: user.state as string,
      userPincode: user.pincode as string,
      items,
      subtotal,
      deliveryFee,
      total,
      paymentProvider: payment.provider,
      paymentStatus: payment.status,
      paymentReference: payment.reference,
      paymentMethodLabel: payment.methodLabel,
      paymentId: payment.paymentId ?? null,
      paymentOrderId: payment.orderId ?? null,
      status: "pending",
      deliveryStatus: "not_shipped",
      paidAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      { success: true, orderId: result.insertedId.toString(), message: "Order placed successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[orders/place] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to place order. Please try again." },
      { status: 500 }
    );
  }
}

export async function handleGetUserOrders(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireUserSessionFromRequest(request);
    if (!auth.ok) return auth.response;
    const email = auth.session.user.email;

    const db = await getDb();
    const raw = await db
      .collection("orders")
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    const orders = raw.map((o) => ({
      ...normalizeOrderPaymentSummary({
        paymentProvider: o.paymentProvider as string | undefined,
        paymentStatus: o.paymentStatus as string | undefined,
        paymentMethodLabel: o.paymentMethodLabel as string | undefined,
        paymentReference: o.paymentReference as string | null | undefined,
        paidAt: o.paidAt as string | null | undefined,
      }),
      _id: o._id.toString(),
      userEmail: o.userEmail,
      userName: o.userName,
      items: o.items,
      subtotal: o.subtotal,
      deliveryFee: o.deliveryFee,
      total: o.total,
      status: o.status,
      deliveryStatus: (o.deliveryStatus as string) ?? "not_shipped",
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    }));

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("[orders/get] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}
