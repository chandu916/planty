/**
 * server/routes/cart.ts
 * GET  /api/cart?email=   — load saved cart for a user
 * PUT  /api/cart          — save (upsert) cart for a user
 * DELETE /api/cart?email= — clear cart after order placed
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUserSessionFromRequest } from "@/server/auth/guards";
import { getDb } from "@/server/db/connection";

const cartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  emoji: z.string(),
  categoryName: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
});

const saveCartSchema = z.object({
  items: z.array(cartItemSchema),
});

export async function handleGetCart(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserSessionFromRequest(request);
  if (!auth.ok) return auth.response;
  const email = auth.session.user.email;

  try {
    const db = await getDb();
    const doc = await db.collection("carts").findOne({ userEmail: email });
    return NextResponse.json({ success: true, items: doc?.items ?? [] });
  } catch (error) {
    console.error("[cart/get] Error:", error);
    return NextResponse.json({ success: false, message: "Failed to load cart." }, { status: 500 });
  }
}

export async function handleSaveCart(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireUserSessionFromRequest(request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const parsed = saveCartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { items } = parsed.data;
    const userEmail = auth.session.user.email;
    const db = await getDb();
    await db.collection("carts").updateOne(
      { userEmail },
      { $set: { items, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[cart/save] Error:", error);
    return NextResponse.json({ success: false, message: "Failed to save cart." }, { status: 500 });
  }
}

export async function handleClearCart(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserSessionFromRequest(request);
  if (!auth.ok) return auth.response;
  const email = auth.session.user.email;

  try {
    const db = await getDb();
    await db.collection("carts").updateOne(
      { userEmail: email },
      { $set: { items: [], updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[cart/clear] Error:", error);
    return NextResponse.json({ success: false, message: "Failed to clear cart." }, { status: 500 });
  }
}
