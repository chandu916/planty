/**
 * server/routes/adminUsers.ts
 * Business logic for GET /api/admin/users
 */
import { NextResponse } from "next/server";
import { getDb } from "@/server/db/connection";

export async function handleGetAllUsers(): Promise<NextResponse> {
  const db = await getDb();
  const allUsers = await db
    .collection("users")
    .find()
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({
    success: true,
    users: allUsers,
    total: allUsers.length,
  });
}
