/**
 * app/api/register/route.ts  <- Next.js route entry point (routing layer only)
 * All business logic lives in server/routes/register.ts
 */
import { NextRequest } from "next/server";
import { handleRegister } from "@/server/routes/register";

export const POST = (req: NextRequest) => handleRegister(req);
