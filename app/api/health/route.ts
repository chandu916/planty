/**
 * app/api/health/route.ts  <- Next.js route entry point (routing layer only)
 * Business logic lives in server/routes/health.ts
 */
import { handleHealthCheck } from "@/server/routes/health";

export const GET = () => handleHealthCheck();
