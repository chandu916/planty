/**
 * app/api/admin/users/route.ts  <- Next.js route entry point (routing layer only)
 * All business logic lives in server/routes/adminUsers.ts
 */
import { handleGetAllUsers } from "@/server/routes/adminUsers";

export const GET = () => handleGetAllUsers();
