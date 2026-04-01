/**
 * server/routes/adminAuth.ts
 * Handles admin login (POST /api/admin/auth/login)
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getDb } from "@/server/db/connection";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function handleAdminLogin(request: NextRequest): Promise<NextResponse> {
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
    const admin = await db.collection("admins").findOne({ email });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials." },
        { status: 401 }
      );
    }

    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, message: "This admin account has been disabled." },
        { status: 403 }
      );
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash as string);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Update lastLoginAt
    await db.collection("admins").updateOne(
      { email },
      { $set: { lastLoginAt: new Date().toISOString() } }
    );

    return NextResponse.json({
      success: true,
      admin: {
        email: admin.email as string,
        name: admin.name as string,
        role: admin.role as string,
      },
    });
  } catch (error) {
    console.error("[adminAuth] Error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
