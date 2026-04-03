import type { NextRequest } from "next/server";
import { handleCreateCheckoutSession } from "@/server/routes/payments";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return handleCreateCheckoutSession(request);
}