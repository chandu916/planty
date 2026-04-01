import { handleAdminLogin } from "@/server/routes/adminAuth";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return handleAdminLogin(request);
}
