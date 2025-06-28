import { cookies } from "next/headers";
import { lucia } from "./lucia";

export async function validateRequest() {
  const sessionId =
    (await cookies()).get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) {
    return { user: null, session: null };
  }

  try {
    const { user, session } = await lucia.validateSession(sessionId);
    return { user, session };
  } catch (error) {
    console.error("Session validation error:", error);
    return { user: null, session: null };
  }
}

export async function setSessionCookie(sessionId: string) {
  "use server";
  try {
    const sessionCookie = lucia.createSessionCookie(sessionId);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  } catch (error) {
    console.error("Failed to set session cookie:", error);
  }
}

export async function clearSessionCookie() {
  "use server";
  try {
    const blankCookie = lucia.createBlankSessionCookie();
    (await cookies()).set(
      blankCookie.name,
      blankCookie.value,
      blankCookie.attributes
    );
  } catch (error) {
    console.error("Failed to clear session cookie:", error);
  }
}
