import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getUserSessionFromCookieStore } from "@/server/auth/guards";
import ProfilePageClient from "./ProfilePageClient";

export const metadata: Metadata = {
  title: "My Profile — Planty",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getUserSessionFromCookieStore(await cookies());
  if (!user) {
    redirect("/login");
  }

  return <ProfilePageClient initialUser={user} />;
}
