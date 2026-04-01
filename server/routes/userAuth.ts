/**
 * server/routes/userAuth.ts
 * Handles user login (POST /api/auth/login)
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getDb } from "@/server/db/connection";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function handleUserLogin(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const db = await getDb();
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "No account found with this email. Please register first." },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      // Legacy user without password — prompt them to re-register or reset
      return NextResponse.json(
        { success: false, message: "Please re-register to set a password for your account." },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash as string);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        email: user.email as string,
        fullName: user.fullName as string,
        phone: user.phone as string,
        address: user.address as string,
        city: user.city as string,
        state: user.state as string,
        pincode: user.pincode as string,
      },
    });
  } catch (error) {
    console.error("[userAuth] Error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
