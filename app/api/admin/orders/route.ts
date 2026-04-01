import { handleGetAllOrders } from "@/server/routes/adminOrders";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleGetAllOrders();
}
