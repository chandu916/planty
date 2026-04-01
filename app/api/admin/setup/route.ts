/**
 * app/api/admin/setup/route.ts
 * One-time database initialisation endpoint.
 * Protected by SETUP_SECRET env var — should be removed or disabled after first run.
 */
import { NextRequest, NextResponse } from "next/server";
import { setupDatabase } from "@/server/db/init";

export async function GET(req: NextRequest) {
  return POST(req);
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-setup-secret");
  if (secret !== (process.env.SETUP_SECRET ?? "planty-setup")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await setupDatabase();
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[setup] DB init failed:", err);
    return NextResponse.json(
      { error: "Setup failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
