import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPlantById } from "@/lib/plants";
import { type PlantReview, summarizePlantReviews } from "@/lib/reviews";
import { requireUserSessionFromRequest } from "@/server/auth/guards";
import { getSessionFromRequest, isUserSession } from "@/server/auth/session";
import { getDb } from "@/server/db/connection";

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(8, "Please add a slightly more detailed review."),
});

const REVIEWABLE_DELIVERY_STATES = ["shipped", "out_for_delivery", "delivered"];

async function findEligibleOrder(userEmail: string, plantId: string) {
  const db = await getDb();
  return db.collection("orders").findOne({
    userEmail,
    status: "accepted",
    deliveryStatus: { $in: REVIEWABLE_DELIVERY_STATES },
    "items.id": plantId,
  });
}

function mapReview(review: Record<string, unknown>): PlantReview {
  return {
    _id: String(review._id),
    plantId: String(review.plantId),
    userEmail: String(review.userEmail),
    userName: String(review.userName),
    rating: Number(review.rating),
    comment: String(review.comment),
    createdAt: String(review.createdAt),
    updatedAt: String(review.updatedAt),
    orderId: String(review.orderId),
  };
}

export async function handleGetPlantReviews(request: NextRequest, plantId: string): Promise<NextResponse> {
  try {
    const plant = getPlantById(plantId);
    if (!plant) {
      return NextResponse.json({ success: false, message: "Plant not found." }, { status: 404 });
    }

    const db = await getDb();
    const rawReviews = await db.collection("plant_reviews").find({ plantId }).sort({ createdAt: -1 }).toArray();
    const reviews = rawReviews.map((review) => mapReview(review as Record<string, unknown>));
    const summary = summarizePlantReviews(reviews);

    const session = await getSessionFromRequest(request);
    let canReview = false;
    let hasPurchased = false;
    let existingReview: PlantReview | null = null;

    if (isUserSession(session)) {
      hasPurchased = !!(await findEligibleOrder(session.user.email, plantId));
      canReview = hasPurchased;
      existingReview = reviews.find((review) => review.userEmail === session.user.email) ?? null;
    }

    return NextResponse.json({
      success: true,
      reviews,
      summary,
      canReview,
      hasPurchased,
      existingReview,
    });
  } catch (error) {
    console.error("[plantReviews/get] Error:", error);
    return NextResponse.json({ success: false, message: "Unable to load plant reviews." }, { status: 500 });
  }
}

export async function handleUpsertPlantReview(request: NextRequest, plantId: string): Promise<NextResponse> {
  try {
    const auth = await requireUserSessionFromRequest(request);
    if (!auth.ok) return auth.response;

    const plant = getPlantById(plantId);
    if (!plant) {
      return NextResponse.json({ success: false, message: "Plant not found." }, { status: 404 });
    }

    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const eligibleOrder = await findEligibleOrder(auth.session.user.email, plantId);
    if (!eligibleOrder) {
      return NextResponse.json(
        { success: false, message: "You can review this plant after it has been shipped to you." },
        { status: 403 },
      );
    }

    const db = await getDb();
    const now = new Date().toISOString();

    await db.collection("plant_reviews").updateOne(
      { plantId, userEmail: auth.session.user.email },
      {
        $set: {
          userName: auth.session.user.fullName,
          rating: parsed.data.rating,
          comment: parsed.data.comment.trim(),
          updatedAt: now,
          orderId: (eligibleOrder._id as ObjectId).toString(),
        },
        $setOnInsert: {
          plantId,
          userEmail: auth.session.user.email,
          createdAt: now,
        },
      },
      { upsert: true },
    );

    return NextResponse.json({ success: true, message: "Your review has been saved." });
  } catch (error) {
    console.error("[plantReviews/post] Error:", error);
    return NextResponse.json({ success: false, message: "Unable to save your review." }, { status: 500 });
  }
}