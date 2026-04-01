/**
 * app/api/profile/route.ts  <- Next.js route entry point (routing layer only)
 * All business logic lives in server/routes/profile.ts
 */
import { NextRequest } from "next/server";
import { handleGetProfile, handleUpdateProfile } from "@/server/routes/profile";

export const GET = (req: NextRequest) => handleGetProfile(req);
export const PUT = (req: NextRequest) => handleUpdateProfile(req);
