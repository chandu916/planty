/**
 * server/routes/profile.ts
 * Business logic for GET /api/profile and PUT /api/profile
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUserSessionFromRequest } from "@/server/auth/guards";
import { getDb } from "@/server/db/connection";

const updateSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  address: z.string().min(5).optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
});

export async function handleGetProfile(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserSessionFromRequest(request);
  if (!auth.ok) return auth.response;
  const email = auth.session.user.email;

  const db = await getDb();
  const user = await db.collection("users").findOne({ email });

  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, user });
}

export async function handleUpdateProfile(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireUserSessionFromRequest(request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updates = parsed.data;
    const email = auth.session.user.email;

    const db = await getDb();
    const collection = db.collection("users");

    const existing = await collection.findOne({ email });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    await collection.updateOne({ email }, { $set: { ...updates, updatedAt: new Date().toISOString() } });
    const updated = await collection.findOne({ email });

    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    console.error("[profile] Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
