export type PlantReview = {
  _id: string;
  plantId: string;
  userEmail: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  orderId: string;
};

export type PlantReviewSummary = {
  averageRating: number;
  reviewCount: number;
  ratingBreakdown: Array<{ stars: number; count: number }>;
};

export function summarizePlantReviews(reviews: PlantReview[]): PlantReviewSummary {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      reviewCount: 0,
      ratingBreakdown: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0 })),
    };
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);

  return {
    averageRating: Math.round((total / reviews.length) * 10) / 10,
    reviewCount: reviews.length,
    ratingBreakdown: [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: reviews.filter((review) => review.rating === stars).length,
    })),
  };
}