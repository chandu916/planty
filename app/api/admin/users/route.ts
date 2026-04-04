/**
 * app/api/admin/users/route.ts  <- Next.js route entry point (routing layer only)
 * All business logic lives in server/routes/adminUsers.ts
 */
import { handleGetAllUsers } from "@/server/routes/adminUsers";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export const GET = (request: NextRequest) => handleGetAllUsers(request);
