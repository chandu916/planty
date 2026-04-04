import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getUserSessionFromCookieStore } from "@/server/auth/guards";
import CouponsPageClient from "./CouponsPageClient";

export const metadata: Metadata = {
  title: "Coupons — Planty",
};

export const dynamic = "force-dynamic";

export default async function ProfileCouponsPage() {
  const user = await getUserSessionFromCookieStore(await cookies());
  if (!user) {
    redirect("/login");
  }

  return <CouponsPageClient initialUser={user} />;
}