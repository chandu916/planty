import { createHash, createHmac, randomUUID, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDb } from "@/server/db/connection";

export type SessionRole = "user" | "admin";

export type UserSessionSnapshot = {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export type AdminSessionSnapshot = {
  email: string;
  name: string;
  role: string;
};

type BaseSessionRecord = {
  sessionId: string;
  role: SessionRole;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
};

type UserSessionRecord = BaseSessionRecord & {
  role: "user";
  user: UserSessionSnapshot;
};

type AdminSessionRecord = BaseSessionRecord & {
  role: "admin";
  admin: AdminSessionSnapshot;
};

export type AuthSessionRecord = UserSessionRecord | AdminSessionRecord;

type SessionCookiePayload = {
  sid: string;
  role: SessionRole;
};

const SESSION_COOKIE_NAME = "planty_session";
const USER_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function getSessionSecret() {
  return process.env.SESSION_SECRET ?? process.env.SETUP_SECRET ?? "planty-dev-session-secret";
}

function toBase64Url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function fromBase64Url<T>(input: string): T | null {
  try {
    return JSON.parse(Buffer.from(input, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

function signPayload(encodedPayload: string) {
  return createHmac("sha256", getSessionSecret()).update(encodedPayload).digest("base64url");
}

function buildCookieValue(payload: SessionCookiePayload) {
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

export function parseSessionCookieValue(value?: string | null): SessionCookiePayload | null {
  if (!value) return null;
  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = signPayload(encodedPayload);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  const payload = fromBase64Url<SessionCookiePayload>(encodedPayload);
  if (!payload || !payload.sid || (payload.role !== "user" && payload.role !== "admin")) {
    return null;
  }

  return payload;
}

function getSessionTtl(role: SessionRole) {
  return role === "admin" ? ADMIN_SESSION_TTL_MS : USER_SESSION_TTL_MS;
}

function getExpiryDate(role: SessionRole) {
  return new Date(Date.now() + getSessionTtl(role));
}

function attachSessionCookie(response: NextResponse, payload: SessionCookiePayload, expiresAt: Date) {
  response.cookies.set(SESSION_COOKIE_NAME, buildCookieValue(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

function isExpired(isoDate: string) {
  return new Date(isoDate).getTime() <= Date.now();
}

export function createUserSessionSnapshot(user: {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}): UserSessionSnapshot {
  return {
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    address: user.address,
    city: user.city,
    state: user.state,
    pincode: user.pincode,
  };
}

export function createAdminSessionSnapshot(admin: {
  email: string;
  name: string;
  role: string;
}): AdminSessionSnapshot {
  return {
    email: admin.email,
    name: admin.name,
    role: admin.role,
  };
}

async function persistSession(session: AuthSessionRecord) {
  const db = await getDb();
  await db.collection("auth_sessions").insertOne(session);
}

export async function createUserSession(user: UserSessionSnapshot) {
  const now = new Date().toISOString();
  const expiresAt = getExpiryDate("user");
  const session: UserSessionRecord = {
    sessionId: randomUUID(),
    role: "user",
    user,
    createdAt: now,
    updatedAt: now,
    expiresAt: expiresAt.toISOString(),
  };
  await persistSession(session);
  return { session, expiresAt };
}

export async function createAdminSession(admin: AdminSessionSnapshot) {
  const now = new Date().toISOString();
  const expiresAt = getExpiryDate("admin");
  const session: AdminSessionRecord = {
    sessionId: randomUUID(),
    role: "admin",
    admin,
    createdAt: now,
    updatedAt: now,
    expiresAt: expiresAt.toISOString(),
  };
  await persistSession(session);
  return { session, expiresAt };
}

export async function deleteSessionById(sessionId: string) {
  const db = await getDb();
  await db.collection("auth_sessions").deleteOne({ sessionId });
}

export async function deleteExistingSessionFromRequest(request: NextRequest) {
  const payload = parseSessionCookieValue(request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null);
  if (!payload) return;
  await deleteSessionById(payload.sid);
}

export async function getSessionFromCookieValue(value?: string | null): Promise<AuthSessionRecord | null> {
  const payload = parseSessionCookieValue(value);
  if (!payload) return null;

  const db = await getDb();
  const session = await db.collection("auth_sessions").findOne({ sessionId: payload.sid }) as AuthSessionRecord | null;

  if (!session) return null;
  if (session.role !== payload.role || isExpired(session.expiresAt)) {
    await deleteSessionById(payload.sid);
    return null;
  }

  await db.collection("auth_sessions").updateOne(
    { sessionId: payload.sid },
    { $set: { updatedAt: new Date().toISOString() } },
  );

  return session;
}

export async function getSessionFromRequest(request: NextRequest) {
  return getSessionFromCookieValue(request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null);
}

export async function getSessionFromCookieStore(cookieStore: { get: (name: string) => { value: string } | undefined }) {
  return getSessionFromCookieValue(cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null);
}

export async function createSessionResponse(response: NextResponse, session: AuthSessionRecord, expiresAt: Date) {
  attachSessionCookie(response, { sid: session.sessionId, role: session.role }, expiresAt);
  return response;
}

export function unauthorizedJson(message = "Unauthorized") {
  return NextResponse.json({ success: false, message }, { status: 401 });
}

export function forbiddenJson(message = "Forbidden") {
  return NextResponse.json({ success: false, message }, { status: 403 });
}

export function isUserSession(session: AuthSessionRecord | null): session is UserSessionRecord {
  return !!session && session.role === "user";
}

export function isAdminSession(session: AuthSessionRecord | null): session is AdminSessionRecord {
  return !!session && session.role === "admin";
}

export async function revokeAllUserSessions(email: string) {
  const db = await getDb();
  await db.collection("auth_sessions").deleteMany({ role: "user", "user.email": email });
}

export async function revokeAllAdminSessions(email: string) {
  const db = await getDb();
  await db.collection("auth_sessions").deleteMany({ role: "admin", "admin.email": email });
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export { SESSION_COOKIE_NAME };