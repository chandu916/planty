"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BadgePercent, CreditCard, Heart, IndianRupee, Loader2, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import BackButton from "@/app/components/BackButton";
import { useCartStore } from "@/lib/cartStore";
import { type PlantCatalogItem } from "@/lib/plants";
import { type PlantReview, type PlantReviewSummary } from "@/lib/reviews";
import { useWishlistStore } from "@/lib/wishlistStore";

const OFFER_LINES = [
  "Extra 10% off with WELCOME10 on eligible first orders",
  "Free delivery on carts above ₹999",
  "Plant care support available after delivery",
];

const PLANT_GALLERY_BY_CATEGORY: Record<string, Array<{ src: string; label: string }>> = {
  bonsai: [
    { src: "/plant-gallery/bonsai/studio.svg", label: "Studio view" },
    { src: "/plant-gallery/bonsai/detail.svg", label: "Leaf detail" },
    { src: "/plant-gallery/bonsai/home.svg", label: "Styled home view" },
  ],
  flowering: [
    { src: "/plant-gallery/flowering/studio.svg", label: "Bloom display" },
    { src: "/plant-gallery/flowering/detail.svg", label: "Petal detail" },
    { src: "/plant-gallery/flowering/home.svg", label: "Balcony setup" },
  ],
  water: [
    { src: "/plant-gallery/water/studio.svg", label: "Pond view" },
    { src: "/plant-gallery/water/detail.svg", label: "Floating detail" },
    { src: "/plant-gallery/water/home.svg", label: "Water bowl setup" },
  ],
  succulents: [
    { src: "/plant-gallery/succulents/studio.svg", label: "Desert shelf view" },
    { src: "/plant-gallery/succulents/detail.svg", label: "Texture detail" },
    { src: "/plant-gallery/succulents/home.svg", label: "Window styling" },
  ],
  indoor: [
    { src: "/plant-gallery/indoor/studio.svg", label: "Living room view" },
    { src: "/plant-gallery/indoor/detail.svg", label: "Leaf split detail" },
    { src: "/plant-gallery/indoor/home.svg", label: "Corner styling" },
  ],
  herbs: [
    { src: "/plant-gallery/herbs/studio.svg", label: "Kitchen garden view" },
    { src: "/plant-gallery/herbs/detail.svg", label: "Fresh leaf detail" },
    { src: "/plant-gallery/herbs/home.svg", label: "Countertop styling" },
  ],
};

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={15}
          className={star <= value ? "fill-amber-400 text-amber-400" : "text-white/15"}
        />
      ))}
    </div>
  );
}

export default function PlantDetailClient({ plant }: { plant: PlantCatalogItem }) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const wishlistItems = useWishlistStore((state) => state.items);
  const [reviews, setReviews] = useState<PlantReview[]>([]);
  const [summary, setSummary] = useState<PlantReviewSummary>({ averageRating: 0, reviewCount: 0, ratingBreakdown: [] });
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState<PlantReview | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const isWishlisted = useMemo(
    () => wishlistItems.some((item) => item.id === plant.id),
    [wishlistItems, plant.id],
  );

  const galleryImages = useMemo(
    () => PLANT_GALLERY_BY_CATEGORY[plant.categoryId] ?? PLANT_GALLERY_BY_CATEGORY.indoor,
    [plant.categoryId],
  );

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [plant.id]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/plants/${plant.id}/reviews`, { cache: "no-store" });
      const json = await response.json();
      if (json.success) {
        setReviews(json.reviews);
        setSummary(json.summary);
        setCanReview(json.canReview);
        setExistingReview(json.existingReview ?? null);
        if (json.existingReview) {
          setRating(json.existingReview.rating);
          setComment(json.existingReview.comment);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews();
  }, [plant.id]);

  const selectedImage = galleryImages[selectedImageIndex] ?? galleryImages[0];

  const handleReviewSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch(`/api/plants/${plant.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const json = await response.json();
      if (json.success) {
        setMessage(json.message ?? "Review saved.");
        await loadReviews();
      } else {
        setMessage(json.message ?? "Unable to save your review.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-transparent">
      <Navbar />

      <div className="flex-1 px-4 pb-16 pt-28 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <BackButton fallbackHref="/" label="Back" className="mb-5" />

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-[34px] border border-white/10 bg-[#101913] shadow-[0_26px_90px_rgba(0,0,0,0.24)]"
              >
                <div className="relative aspect-[4/3] min-h-[420px] w-full">
                  <Image
                    src={selectedImage.src}
                    alt={`${plant.name} ${selectedImage.label.toLowerCase()}`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 52vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">Planty Select</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-2xl font-semibold text-white">{plant.name}</p>
                        <p className="mt-1 text-sm text-white/70">{selectedImage.label}</p>
                      </div>
                      <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
                        {plant.categoryName}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="grid gap-4 sm:grid-cols-3">
                {galleryImages.map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`unstyled-action overflow-hidden rounded-[24px] border text-left shadow-[0_14px_48px_rgba(0,0,0,0.18)] transition ${
                      index === selectedImageIndex
                        ? "border-green-300/45 bg-white/10"
                        : "border-white/10 bg-white/[0.04] hover:border-white/20"
                    }`}
                  >
                    <div className="relative aspect-[4/3] w-full bg-[#101913]">
                      <Image
                        src={image.src}
                        alt={`${plant.name} ${image.label.toLowerCase()}`}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45">{image.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[34px] border border-white/10 bg-white/[0.045] p-7 shadow-[0_26px_90px_rgba(0,0,0,0.24)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-green-300/55">{plant.categoryName}</p>
                <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">{plant.name}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-green-100/55 sm:text-base">{plant.description}</p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1.5 text-sm text-amber-100">
                    <Stars value={Math.round(summary.averageRating || 4)} />
                    <span>
                      {summary.reviewCount > 0 ? `${summary.averageRating} (${summary.reviewCount} reviews)` : "New arrival"}
                    </span>
                  </div>
                  {plant.badge ? (
                    <span className="rounded-full border border-green-400/20 bg-green-500/10 px-3 py-1.5 text-sm font-medium text-green-200">
                      {plant.badge}
                    </span>
                  ) : null}
                </div>

                <div className="mt-6 flex items-end gap-3">
                  <div className="flex items-center text-4xl font-bold text-white">
                    <IndianRupee size={28} className="mt-1" />
                    {plant.price}
                  </div>
                  <span className="pb-1 text-sm text-green-100/45">inclusive of all taxes</span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-green-100/35">Care guide</p>
                    <p className="mt-2 text-sm text-white/85">{plant.care}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-green-100/35">Special offer</p>
                    <p className="mt-2 text-sm text-white/85">Use `WELCOME10` or apply any active profile coupon.</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => addItem({ id: plant.id, name: plant.name, price: plant.price, emoji: plant.categoryEmoji, categoryName: plant.categoryName })}
                    className="rounded-full bg-green-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-green-300"
                  >
                    Add to cart
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(plant)}
                    className={`rounded-full border px-5 py-3 text-sm font-medium transition ${
                      isWishlisted
                        ? "border-rose-400/30 bg-rose-500/10 text-rose-200"
                        : "border-white/10 bg-white/[0.04] text-green-100/70 hover:border-rose-400/20 hover:text-white"
                    }`}
                  >
                    {isWishlisted ? "Wishlisted" : "Add to wishlist"}
                  </button>
                </div>
              </motion.div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: BadgePercent, title: "Coupons & offers", detail: OFFER_LINES[0] },
                  { icon: Truck, title: "Delivery", detail: "Fast home delivery across eligible pincodes." },
                  { icon: CreditCard, title: "COD availability", detail: "Cash on delivery available for selected local deliveries." },
                  { icon: RotateCcw, title: "Returns", detail: "Easy return and replacement support for damaged deliveries." },
                  { icon: ShieldCheck, title: "Plant protection", detail: "Healthy plant assurance and support guidance after purchase." },
                  { icon: BadgePercent, title: "Bonus perks", detail: OFFER_LINES[2] },
                ].map(({ icon: Icon, title, detail }) => (
                  <div key={title} className="rounded-[26px] border border-white/10 bg-white/[0.045] p-5">
                    <div className="inline-flex rounded-full border border-white/10 bg-black/20 p-2 text-green-300">
                      <Icon size={16} />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-white">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-green-100/45">{detail}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-10 grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6">
              <h2 className="text-2xl font-semibold text-white">Customer reviews</h2>
              <div className="mt-4 flex items-end gap-3">
                <span className="text-5xl font-bold text-white">{summary.averageRating || "0.0"}</span>
                <div className="pb-2">
                  <Stars value={Math.round(summary.averageRating || 0)} />
                  <p className="mt-2 text-sm text-green-100/45">{summary.reviewCount} verified review{summary.reviewCount === 1 ? "" : "s"}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {summary.ratingBreakdown.map((row) => (
                  <div key={row.stars} className="flex items-center gap-3 text-sm">
                    <span className="w-10 text-green-100/55">{row.stars} star</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${summary.reviewCount > 0 ? (row.count / summary.reviewCount) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-green-100/45">{row.count}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[24px] border border-white/10 bg-black/20 p-5">
                <h3 className="text-lg font-semibold text-white">Write a review</h3>
                <p className="mt-2 text-sm text-green-100/45">
                  Reviews are enabled only for customers who bought this plant and reached shipped status or beyond.
                </p>

                {canReview ? (
                  <form onSubmit={handleReviewSubmit} className="mt-5 space-y-4">
                    <div>
                      <p className="mb-2 text-sm text-green-100/55">Your rating</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="unstyled-action text-amber-400"
                          >
                            <Star size={22} className={star <= rating ? "fill-current" : ""} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      rows={4}
                      placeholder="Tell other buyers how the plant arrived, how healthy it looked, and whether the quality matched expectations."
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-green-100/25 focus:border-green-400/30 focus:outline-none focus:ring-2 focus:ring-green-400/20"
                    />
                    {message ? <p className="text-sm text-green-200/70">{message}</p> : null}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-full bg-green-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-green-300 disabled:opacity-60"
                    >
                      {submitting ? "Saving..." : existingReview ? "Update review" : "Submit review"}
                    </button>
                  </form>
                ) : (
                  <p className="mt-5 text-sm text-green-100/45">
                    Buy this plant and wait until the order is shipped to leave a verified review here.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-white">What buyers said</h2>
                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-green-100/45">
                    <Loader2 size={14} className="animate-spin" />
                    Loading reviews
                  </div>
                ) : null}
              </div>

              <div className="mt-6 space-y-4">
                {reviews.length === 0 && !loading ? (
                  <div className="rounded-[24px] border border-white/10 bg-black/20 px-5 py-10 text-center text-green-100/45">
                    No reviews yet for this plant.
                  </div>
                ) : null}

                {reviews.map((review) => (
                  <div key={review._id} className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{review.userName}</p>
                        <p className="text-xs text-green-100/35">Verified buyer · {new Date(review.createdAt).toLocaleDateString("en-IN")}</p>
                      </div>
                      <Stars value={review.rating} />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-green-100/75">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer minimal />
    </main>
  );
}