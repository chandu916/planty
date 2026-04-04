import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getUserSessionFromCookieStore } from "@/server/auth/guards";
import WishlistPageClient from "./WishlistPageClient";

export const metadata: Metadata = {
  title: "Wishlist — Planty",
};

export const dynamic = "force-dynamic";

export default async function ProfileWishlistPage() {
  const user = await getUserSessionFromCookieStore(await cookies());
  if (!user) {
    redirect("/login");
  }

  return <WishlistPageClient initialUser={user} />;
}