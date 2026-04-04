import { handleGetAllOrders } from "@/server/routes/adminOrders";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleGetAllOrders(request);
}
