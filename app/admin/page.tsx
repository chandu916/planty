import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/mongodb";
import type { Metadata } from "next";
import { getAdminSessionFromCookieStore } from "@/server/auth/guards";
import AdminDashboardClient from "./AdminDashboardClient";

export const metadata: Metadata = {
  title: "Admin Dashboard · Planty",
};

// Always fetch fresh data (no cache)
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await getAdminSessionFromCookieStore(await cookies());
  if (!admin) {
    redirect("/login");
  }

  const database = await getDb();
  const raw = await database
    .collection("users")
    .find()
    .sort({ createdAt: -1 })
    .toArray();

  // Serialize ObjectIds to strings for the client component
  const allUsers = raw.map((u) => ({
    _id: u._id.toString(),
    fullName: u.fullName as string,
    email: u.email as string,
    phone: u.phone as string,
    address: u.address as string,
    city: u.city as string,
    state: u.state as string,
    pincode: u.pincode as string,
    createdAt: u.createdAt as string,
  }));

  return <AdminDashboardClient initialUsers={allUsers} initialAdmin={admin} />;
}
