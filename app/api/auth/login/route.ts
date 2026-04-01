import { handleUserLogin } from "@/server/routes/userAuth";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return handleUserLogin(request);
}
