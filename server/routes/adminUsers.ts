/**
 * server/routes/adminUsers.ts
 * Business logic for GET /api/admin/users
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAdminSessionFromRequest } from "@/server/auth/guards";
import { getDb } from "@/server/db/connection";

export async function handleGetAllUsers(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdminSessionFromRequest(request);
  if (!auth.ok) return auth.response;

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
