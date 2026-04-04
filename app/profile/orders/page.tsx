import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getUserSessionFromCookieStore } from "@/server/auth/guards";
import OrdersPageClient from "./OrdersPageClient";

export const metadata: Metadata = {
  title: "My Orders — Planty",
};

export const dynamic = "force-dynamic";

export default async function ProfileOrdersPage() {
  const user = await getUserSessionFromCookieStore(await cookies());
  if (!user) {
    redirect("/login");
  }

  return <OrdersPageClient initialUser={user} />;
}