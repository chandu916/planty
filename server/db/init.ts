/**
 * server/db/init.ts
 * Sets up PlantyDB collections with:
 *  - MongoDB JSON Schema validation (server-enforced field rules)
 *  - Indexes for fast queries
 *  - A default superadmin document (only inserted if no admin exists)
 *
 * Call setupDatabase() once — it is fully idempotent (safe to re-run).
 */
import bcrypt from "bcryptjs";
import { getDb } from "@/server/db/connection";

// ─── JSON Schema validators ───────────────────────────────────────────────────

const usersValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["fullName", "email", "phone", "address", "city", "state", "pincode", "createdAt", "updatedAt"],
    additionalProperties: true,
    properties: {
      fullName:  { bsonType: "string", minLength: 2,  description: "Customer full name" },
      email:     { bsonType: "string", pattern: "^.+@.+\\..+$", description: "Unique delivery email" },
      phone:     { bsonType: "string", pattern: "^[6-9][0-9]{9}$", description: "10-digit Indian mobile" },
      address:   { bsonType: "string", minLength: 5,  description: "Street / flat / building" },
      city:      { bsonType: "string", minLength: 2,  description: "City" },
      state:     { bsonType: "string", minLength: 2,  description: "Indian state" },
      pincode:   { bsonType: "string", pattern: "^[0-9]{6}$", description: "6-digit postal code" },
      createdAt: { bsonType: "string", description: "ISO 8601 creation timestamp" },
      updatedAt: { bsonType: "string", description: "ISO 8601 last-update timestamp" },
    },
  },
};

const adminsValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["name", "email", "passwordHash", "role", "isActive", "createdAt", "lastLoginAt"],
    additionalProperties: true,
    properties: {
      name:          { bsonType: "string", minLength: 2,  description: "Admin display name" },
      email:         { bsonType: "string", pattern: "^.+@.+\\..+$", description: "Unique login email" },
      passwordHash:  { bsonType: "string", description: "Bcrypt hashed password — never expose to client" },
      role:          { bsonType: "string", enum: ["superadmin", "admin"], description: "Admin privilege level" },
      isActive:      { bsonType: "bool",   description: "False = account disabled" },
      createdAt:     { bsonType: "string", description: "ISO 8601 creation timestamp" },
      lastLoginAt:   { description: "ISO 8601 last login or null" },
    },
  },
};

const ordersValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["userEmail", "userName", "items", "subtotal", "deliveryFee", "total", "status", "deliveryStatus", "createdAt", "updatedAt"],
    additionalProperties: true,
    properties: {
      userEmail:      { bsonType: "string", description: "Email of the ordering user" },
      userName:       { bsonType: "string", description: "Full name of the ordering user" },
      items:          { bsonType: "array",  description: "Ordered plant items" },
      subtotal:       { bsonType: "number", minimum: 0 },
      deliveryFee:    { bsonType: "number", minimum: 0 },
      total:          { bsonType: "number", minimum: 0 },
      status:         { bsonType: "string", enum: ["pending", "accepted", "declined"] },
      deliveryStatus: { bsonType: "string", enum: ["not_shipped", "shipped", "out_for_delivery", "delivered"] },
      createdAt:      { bsonType: "string" },
      updatedAt:      { bsonType: "string" },
    },
  },
};

const cartsValidator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["userEmail", "items", "updatedAt"],
    additionalProperties: true,
    properties: {
      userEmail:  { bsonType: "string", description: "Unique user email — one cart per user" },
      items:      { bsonType: "array",  description: "Cart items" },
      updatedAt:  { bsonType: "string", description: "ISO 8601 last save timestamp" },
    },
  },
};

// ─── Main init function ───────────────────────────────────────────────────────

export async function setupDatabase(): Promise<{ message: string; details: string[] }> {
  const db = await getDb();
  const log: string[] = [];
  const now = new Date().toISOString();

  // Helper: create collection if it doesn't exist, or update validator if it does
  const existingCollections = (await db.listCollections().toArray()).map((c) => c.name);

  // ── users collection ──────────────────────────────────────────────────────
  if (!existingCollections.includes("users")) {
    await db.createCollection("users", { validator: usersValidator });
    log.push("✓ Created collection: users");
  } else {
    try {
      await db.command({ collMod: "users", validator: usersValidator, validationLevel: "moderate" });
      log.push("✓ Verified collection: users (validator updated)");
    } catch (e) {
      log.push("⚠ Collection users exists (validator update skipped — insufficient permissions)");
    }
  }

  const usersCol = db.collection("users");
  await usersCol.createIndex({ email: 1 }, { unique: true, name: "email_unique" });
  await usersCol.createIndex({ city: 1 },  { name: "city_idx" });
  await usersCol.createIndex({ createdAt: -1 }, { name: "createdAt_desc" });
  log.push("✓ Indexes ready: users.email (unique), users.city, users.createdAt");

  // ── admins collection ─────────────────────────────────────────────────────
  if (!existingCollections.includes("admins")) {
    await db.createCollection("admins", { validator: adminsValidator });
    log.push("✓ Created collection: admins");
  } else {
    try {
      await db.command({ collMod: "admins", validator: adminsValidator, validationLevel: "moderate" });
      log.push("✓ Verified collection: admins (validator updated)");
    } catch (e) {
      log.push("⚠ Collection admins exists (validator update skipped — insufficient permissions)");
    }
  }

  const adminsCol = db.collection("admins");
  await adminsCol.createIndex({ email: 1 }, { unique: true, name: "email_unique" });
  await adminsCol.createIndex({ role: 1 },  { name: "role_idx" });
  log.push("✓ Indexes ready: admins.email (unique), admins.role");

  // ── orders collection ─────────────────────────────────────────────────────
  if (!existingCollections.includes("orders")) {
    await db.createCollection("orders", { validator: ordersValidator });
    log.push("✓ Created collection: orders");
  } else {
    try {
      await db.command({ collMod: "orders", validator: ordersValidator, validationLevel: "moderate" });
      log.push("✓ Verified collection: orders (validator updated)");
    } catch (e) {
      log.push("⚠ Collection orders exists (validator update skipped — insufficient permissions)");
    }
  }

  const ordersCol = db.collection("orders");
  await ordersCol.createIndex({ userEmail: 1 }, { name: "userEmail_idx" });
  await ordersCol.createIndex({ status: 1 },     { name: "status_idx" });
  await ordersCol.createIndex({ deliveryStatus: 1 }, { name: "deliveryStatus_idx" });
  await ordersCol.createIndex({ createdAt: -1 }, { name: "createdAt_desc" });
  log.push("✓ Indexes ready: orders.userEmail, orders.status, orders.deliveryStatus, orders.createdAt");

  // ── carts collection ──────────────────────────────────────────────────────
  if (!existingCollections.includes("carts")) {
    await db.createCollection("carts", { validator: cartsValidator });
    log.push("✓ Created collection: carts");
  } else {
    try {
      await db.command({ collMod: "carts", validator: cartsValidator, validationLevel: "moderate" });
      log.push("✓ Verified collection: carts (validator updated)");
    } catch (e) {
      log.push("⚠ Collection carts exists (validator update skipped — insufficient permissions)");
    }
  }

  const cartsCol = db.collection("carts");
  await cartsCol.createIndex({ userEmail: 1 }, { unique: true, name: "userEmail_unique" });
  log.push("✓ Indexes ready: carts.userEmail (unique)");

  // ── Seed default superadmin (only if no admin exists) ─────────────────────
  const adminCount = await adminsCol.countDocuments();
  if (adminCount === 0) {
    const passwordHash = await bcrypt.hash("Planty@Admin2026", 12);
    await adminsCol.insertOne({
      name: "Planty Admin",
      email: "admin@planty.in",
      passwordHash,
      role: "superadmin",
      isActive: true,
      createdAt: now,
      lastLoginAt: null,
    });
    log.push("✓ Seeded default superadmin  →  email: admin@planty.in  |  password: Planty@Admin2026");
    log.push("⚠  IMPORTANT: Change the default admin password after first login!");
  } else {
    log.push(`✓ Admins collection already has ${adminCount} document(s) — skipped seeding`);
  }

  return { message: "PlantyDB setup complete", details: log };
}
