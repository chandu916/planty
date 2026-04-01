import { handleChangePassword } from "@/server/routes/changePassword";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  return handleChangePassword(request);
}
