import { NextRequest, NextResponse } from "next/server";
import {
  clearSessionCookie,
  createSessionResponse,
  deleteExistingSessionFromRequest,
  deleteSessionById,
  getSessionFromRequest,
  isAdminSession,
  isUserSession,
} from "@/server/auth/session";

export async function handleGetCurrentSession(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ success: true, authenticated: false });
  }

  if (isUserSession(session)) {
    return NextResponse.json({ success: true, authenticated: true, role: "user", user: session.user });
  }

  if (isAdminSession(session)) {
    return NextResponse.json({ success: true, authenticated: true, role: "admin", admin: session.admin });
  }

  return NextResponse.json({ success: true, authenticated: false });
}

export async function handleLogout(request: NextRequest): Promise<NextResponse> {
  const session = await getSessionFromRequest(request);
  if (session) {
    await deleteSessionById(session.sessionId);
  }

  const response = NextResponse.json({ success: true, message: "Logged out successfully." });
  clearSessionCookie(response);
  return response;
}

export async function replaceUserSession(request: NextRequest, response: NextResponse, createSession: () => Promise<Awaited<ReturnType<typeof import("@/server/auth/session").createUserSession>>>) {
  await deleteExistingSessionFromRequest(request);
  const { session, expiresAt } = await createSession();
  return createSessionResponse(response, session, expiresAt);
}

export async function replaceAdminSession(request: NextRequest, response: NextResponse, createSession: () => Promise<Awaited<ReturnType<typeof import("@/server/auth/session").createAdminSession>>>) {
  await deleteExistingSessionFromRequest(request);
  const { session, expiresAt } = await createSession();
  return createSessionResponse(response, session, expiresAt);
}