import type { NextRequest } from "next/server";
import { handleGetPlantReviews, handleUpsertPlantReview } from "@/server/routes/plantReviews";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleGetPlantReviews(request, id);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleUpsertPlantReview(request, id);
}