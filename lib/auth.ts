import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const DEFAULT_AUTHENTICATED_ROUTE = "/home";
export const DEFAULT_UNAUTHENTICATED_ROUTE = "/signup";
export const SESSION_COOKIE_NAME = "bettermailer.session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export async function getSessionUserId(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function isAuthenticated(): Promise<boolean> {
  return Boolean(await getSessionUserId());
}

export async function createSession(userId: string): Promise<void> {
  (await cookies()).set({
    name: SESSION_COOKIE_NAME,
    value: userId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}

export async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect(DEFAULT_UNAUTHENTICATED_ROUTE);
  }
}

export async function redirectIfAuthenticated(): Promise<void> {
  if (await isAuthenticated()) {
    redirect(DEFAULT_AUTHENTICATED_ROUTE);
  }
}
