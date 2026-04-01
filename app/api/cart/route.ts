import { NextRequest } from "next/server";
import { handleGetCart, handleSaveCart, handleClearCart } from "@/server/routes/cart";

export const runtime = "nodejs";

export function GET(request: NextRequest) {
  return handleGetCart(request);
}

export function PUT(request: NextRequest) {
  return handleSaveCart(request);
}

export function DELETE(request: NextRequest) {
  return handleClearCart(request);
}
