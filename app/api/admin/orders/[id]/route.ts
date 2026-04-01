import { handleUpdateOrderStatus } from "@/server/routes/adminOrders";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleUpdateOrderStatus(request, id);
}
