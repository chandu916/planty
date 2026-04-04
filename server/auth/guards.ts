import type { NextRequest } from "next/server";
import { getSessionFromCookieStore, getSessionFromRequest, isAdminSession, isUserSession, unauthorizedJson, type AdminSessionSnapshot, type UserSessionSnapshot } from "@/server/auth/session";

export async function requireUserSessionFromRequest(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!isUserSession(session)) {
    return { ok: false as const, response: unauthorizedJson("Please log in to continue.") };
  }

  return { ok: true as const, session };
}

export async function requireAdminSessionFromRequest(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!isAdminSession(session)) {
    return { ok: false as const, response: unauthorizedJson("Admin access required.") };
  }

  return { ok: true as const, session };
}

export async function getUserSessionFromCookieStore(cookieStore: { get: (name: string) => { value: string } | undefined }) {
  const session = await getSessionFromCookieStore(cookieStore);
  return isUserSession(session) ? session.user : null;
}

export async function getAdminSessionFromCookieStore(cookieStore: { get: (name: string) => { value: string } | undefined }) {
  const session = await getSessionFromCookieStore(cookieStore);
  return isAdminSession(session) ? session.admin : null;
}

export type ProtectedUser = UserSessionSnapshot;
export type ProtectedAdmin = AdminSessionSnapshot;