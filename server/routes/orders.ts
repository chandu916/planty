/**
 * server/routes/orders.ts
 * POST /api/orders  — place an order
 * GET  /api/orders  — get orders for a user (by email)
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/server/db/connection";

const orderItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  emoji: z.string(),
  categoryName: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
});

const placeOrderSchema = z.object({
  userEmail: z.string().email(),
  items: z.array(orderItemSchema).min(1, "Cart is empty"),
  subtotal: z.number().nonnegative(),
  deliveryFee: z.number().nonnegative(),
  total: z.number().positive(),
});

export async function handlePlaceOrder(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = placeOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { userEmail, items, subtotal, deliveryFee, total } = parsed.data;

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
      status: "pending",
      deliveryStatus: "not_shipped",
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
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const raw = await db
      .collection("orders")
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    const orders = raw.map((o) => ({
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
