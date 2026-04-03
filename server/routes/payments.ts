import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/server/db/connection";
import type { CheckoutSession } from "@/lib/payment";

const orderItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  emoji: z.string(),
  categoryName: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
});

const createCheckoutSchema = z.object({
  userEmail: z.string().email(),
  items: z.array(orderItemSchema).min(1, "Cart is empty"),
  subtotal: z.number().nonnegative(),
  deliveryFee: z.number().nonnegative(),
  total: z.number().positive(),
});

const toPaise = (amount: number) => Math.round(amount * 100);

async function buildMockCheckout(params: {
  name: string;
  email: string;
  contact: string;
  total: number;
  itemsCount: number;
}): Promise<CheckoutSession> {
  return {
    provider: "mock",
    sessionId: `mock_${randomUUID()}`,
    amount: toPaise(params.total),
    currency: "INR",
    displayAmount: `₹${params.total}`,
    merchantName: "Planty",
    description: `Test checkout for ${params.itemsCount} plant item${params.itemsCount === 1 ? "" : "s"}`,
    instructions: "Mock checkout is active. Add Razorpay test keys later to switch to a real hosted checkout.",
    customer: {
      name: params.name,
      email: params.email,
      contact: params.contact,
    },
  };
}

async function buildRazorpayCheckout(params: {
  name: string;
  email: string;
  contact: string;
  total: number;
  itemsCount: number;
}): Promise<CheckoutSession | null> {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) return null;

  try {
    const amount = toPaise(params.total);
    const receipt = `planty_${Date.now()}`;
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt,
        notes: {
          source: "planty",
          itemsCount: String(params.itemsCount),
          customerEmail: params.email,
        },
      }),
    });

    if (!response.ok) {
      console.error("[payments/checkout] Razorpay order creation failed", await response.text());
      return null;
    }

    const data = await response.json() as { id: string; amount: number; currency: "INR" };

    return {
      provider: "razorpay",
      sessionId: data.id,
      keyId,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      displayAmount: `₹${params.total}`,
      merchantName: "Planty",
      description: `Plant order for ${params.itemsCount} item${params.itemsCount === 1 ? "" : "s"}`,
      customer: {
        name: params.name,
        email: params.email,
        contact: params.contact,
      },
    };
  } catch (error) {
    console.error("[payments/checkout] Razorpay request error", error);
    return null;
  }
}

export async function handleCreateCheckoutSession(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = createCheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { userEmail, items, total } = parsed.data;
    const db = await getDb();
    const user = await db.collection("users").findOne({ email: userEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found. Please log in before paying." },
        { status: 404 }
      );
    }

    const customer = {
      name: String(user.fullName ?? "Planty Customer"),
      email: String(user.email ?? userEmail),
      contact: String(user.phone ?? ""),
      total,
      itemsCount: items.length,
    };

    const checkout = (await buildRazorpayCheckout(customer)) ?? (await buildMockCheckout(customer));

    return NextResponse.json({ success: true, checkout });
  } catch (error) {
    console.error("[payments/checkout] Error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to start payment. Please try again." },
      { status: 500 }
    );
  }
}