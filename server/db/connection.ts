/**
 * server/db/connection.ts
 * Re-exports the shared MongoDB connection from lib/mongodb.
 * All server-side code should import getDb from here.
 */
export { getDb, default as clientPromise } from "@/lib/mongodb";
