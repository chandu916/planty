import { getDb } from "@/lib/mongodb";
import type { Metadata } from "next";
import AdminDashboardClient from "./AdminDashboardClient";

export const metadata: Metadata = {
  title: "Admin Dashboard · Planty",
};

// Always fetch fresh data (no cache)
export const dynamic = "force-dynamic";

export default async function AdminPage() {
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

  return <AdminDashboardClient initialUsers={allUsers} />;
}
