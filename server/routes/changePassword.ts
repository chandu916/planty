/**
 * server/routes/changePassword.ts
 * PUT /api/profile/password — change user's own password
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getDb } from "@/server/db/connection";

const changePasswordSchema = z.object({
  email: z.string().email(),
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function handleChangePassword(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, currentPassword, newPassword } = parsed.data;

    const db = await getDb();
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { success: false, message: "No password set. Please re-register to set a password." },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash as string);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect." },
        { status: 401 }
      );
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await db.collection("users").updateOne(
      { email },
      { $set: { passwordHash: newPasswordHash, updatedAt: new Date().toISOString() } }
    );

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("[changePassword] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to change password. Please try again." },
      { status: 500 }
    );
  }
}
