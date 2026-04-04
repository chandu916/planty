/**
 * server/routes/register.ts
 * Business logic for POST /api/register
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createUserSession, createUserSessionSnapshot } from "@/server/auth/session";
import { replaceUserSession } from "@/server/routes/authSession";
import { getDb } from "@/server/db/connection";

const registrationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  address: z.string().min(5, "Address is too short"),
  city: z.string().min(2, "City name is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

export async function handleRegister(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { fullName, email, password, phone, address, city, state, pincode } = parsed.data;

    const db = await getDb();
    const collection = db.collection("users");

    const existing = await collection.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, errors: { email: ["This email is already registered."] } },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = {
      fullName,
      email,
      passwordHash,
      phone,
      address,
      city,
      state,
      pincode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await collection.insertOne(user);

    const response = NextResponse.json(
      {
        success: true,
        message: "Registration successful! We'll deliver to your address.",
        user: createUserSessionSnapshot(user),
      },
      { status: 201 },
    );

    return replaceUserSession(request, response, () =>
      createUserSession(createUserSessionSnapshot(user)),
    );
  } catch (error) {
    console.error("[register] Error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
