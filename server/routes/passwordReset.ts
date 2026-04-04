import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/server/db/connection";
import { hashToken, revokeAllUserSessions } from "@/server/auth/session";
import { isResetEmailConfigured, sendResetPasswordEmail } from "@/server/mail/resetEmail";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(20, "Reset token is invalid"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const RESET_TTL_MS = 1000 * 60 * 30;

function buildResetUrl(request: NextRequest, token: string) {
  return `${request.nextUrl.origin}/reset-password?token=${token}`;
}

export async function handleForgotPassword(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { email } = parsed.data;
    const db = await getDb();
    const user = await db.collection("users").findOne({ email });

    if (user) {
      const token = randomBytes(24).toString("hex");
      const now = new Date();
      const resetUrl = buildResetUrl(request, token);

      await db.collection("password_reset_tokens").deleteMany({ userEmail: email });
      await db.collection("password_reset_tokens").insertOne({
        userEmail: email,
        tokenHash: hashToken(token),
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + RESET_TTL_MS).toISOString(),
        usedAt: null,
      });

      if (!isResetEmailConfigured()) {
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { success: false, message: "Password reset email is unavailable right now." },
            { status: 500 },
          );
        }
      } else {
        await sendResetPasswordEmail({ to: email, resetUrl });
      }

      const response: Record<string, unknown> = {
        success: true,
        message: isResetEmailConfigured()
          ? "If the account exists, password reset instructions were sent."
          : "If the account exists, password reset instructions are ready.",
      };

      if (process.env.NODE_ENV !== "production") {
        response.resetUrl = resetUrl;
        response.emailConfigured = isResetEmailConfigured();
      }

      return NextResponse.json(response);
    }

    return NextResponse.json({
      success: true,
      message: "If the account exists, password reset instructions are ready.",
    });
  } catch (error) {
    console.error("[passwordReset/forgot] Error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to start password reset right now." },
      { status: 500 },
    );
  }
}

export async function handleResetPassword(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { token, password } = parsed.data;
    const db = await getDb();
    const resetDoc = await db.collection("password_reset_tokens").findOne({ tokenHash: hashToken(token) });

    if (!resetDoc || resetDoc.usedAt || new Date(resetDoc.expiresAt as string).getTime() <= Date.now()) {
      return NextResponse.json(
        { success: false, message: "This reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    const userEmail = resetDoc.userEmail as string;

    await db.collection("users").updateOne(
      { email: userEmail },
      {
        $set: {
          passwordHash: await bcrypt.hash(password, 12),
          updatedAt: new Date().toISOString(),
        },
      },
    );

    await db.collection("password_reset_tokens").updateOne(
      { _id: resetDoc._id },
      { $set: { usedAt: new Date().toISOString() } },
    );

    await revokeAllUserSessions(userEmail);

    return NextResponse.json({
      success: true,
      message: "Password reset successful. Please log in.",
    });
  } catch (error) {
    console.error("[passwordReset/reset] Error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to reset password right now." },
      { status: 500 },
    );
  }
}