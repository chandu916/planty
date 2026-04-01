/**
 * server/routes/health.ts
 * Connection health-check — GET /api/health
 * Returns MongoDB ping result and current DB name.
 */
import { NextResponse } from "next/server";
import { getDb } from "@/server/db/connection";

export async function handleHealthCheck(): Promise<NextResponse> {
  try {
    const db = await getDb();
    // MongoDB driver ping command — returns { ok: 1 } on success
    const ping = await db.command({ ping: 1 });
    const stats = await db.stats();

    return NextResponse.json({
      success: true,
      database: db.databaseName,
      ping,
      collections: stats.collections,
      message: "Connected to MongoDB Atlas ✓",
    });
  } catch (error) {
    console.error("[health] MongoDB connection failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "MongoDB connection failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 503 }
    );
  }
}
