/**
 * server/routes/adminOrders.ts
 * GET  /api/admin/orders       — fetch all orders
 * PUT  /api/admin/orders/[id]  — accept or decline an order
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getDb } from "@/server/db/connection";
import { normalizeOrderPaymentSummary } from "@/lib/payment";

export async function handleGetAllOrders(): Promise<NextResponse> {
  try {
    const db = await getDb();
    const raw = await db
      .collection("orders")
      .find()
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
      userPhone: o.userPhone,
      userAddress: o.userAddress,
      userCity: o.userCity,
      userState: o.userState,
      userPincode: o.userPincode,
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
    console.error("[adminOrders/getAll] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}

const updateStatusSchema = z.object({
  status: z.enum(["accepted", "declined"]).optional(),
  deliveryStatus: z.enum(["not_shipped", "shipped", "out_for_delivery", "delivered"]).optional(),
}).refine((d) => d.status !== undefined || d.deliveryStatus !== undefined, {
  message: "Provide status or deliveryStatus to update.",
});

export async function handleUpdateOrderStatus(
  request: NextRequest,
  id: string
): Promise<NextResponse> {
  try {
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid order ID." }, { status: 400 });
    }

    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const db = await getDb();
    const $set: Record<string, string> = { updatedAt: new Date().toISOString() };
    if (parsed.data.status)         $set.status = parsed.data.status;
    if (parsed.data.deliveryStatus) $set.deliveryStatus = parsed.data.deliveryStatus;

    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      { $set }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    const msg = [
      parsed.data.status         ? `Order ${parsed.data.status}` : null,
      parsed.data.deliveryStatus ? `Delivery: ${parsed.data.deliveryStatus.replace(/_/g, " ")}` : null,
    ].filter(Boolean).join(", ");
    return NextResponse.json({ success: true, message: msg });
  } catch (error) {
    console.error("[adminOrders/updateStatus] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order status." },
      { status: 500 }
    );
  }
}
