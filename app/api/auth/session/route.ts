import type { NextRequest } from "next/server";
import { handleGetCurrentSession, handleLogout } from "@/server/routes/authSession";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleGetCurrentSession(request);
}

export async function POST(request: NextRequest) {
  return handleLogout(request);
}