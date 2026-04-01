/**
 * server/routes/profile.ts
 * Business logic for GET /api/profile and PUT /api/profile
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/server/db/connection";

const updateSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  address: z.string().min(5).optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
});

export async function handleGetProfile(request: NextRequest): Promise<NextResponse> {
  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json(
      { success: false, message: "Email is required" },
      { status: 400 }
    );
  }

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
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, ...updates } = parsed.data;

    const db = await getDb();
    const collection = db.collection("users");

    const existing = await collection.findOne({ email });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    await collection.updateOne({ email }, { $set: updates });
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
