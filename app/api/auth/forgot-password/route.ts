import type { NextRequest } from "next/server";
import { handleForgotPassword } from "@/server/routes/passwordReset";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return handleForgotPassword(request);
}