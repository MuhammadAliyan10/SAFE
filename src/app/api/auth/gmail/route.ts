// /app/api/auth/gmail.ts
import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const projectId = searchParams.get("projectId");

  if (!userId || !projectId) {
    console.error("Missing userId or projectId:", { userId, projectId });
    return NextResponse.json(
      { message: "Missing userId or projectId" },
      { status: 400 }
    );
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("Google OAuth credentials not configured");
    return NextResponse.json(
      { message: "Google OAuth credentials not configured" },
      { status: 500 }
    );
  }

  const state = sign(
    { state: crypto.randomUUID(), userId, projectId },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "10m" }
  );

  const redirectUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  redirectUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID);
  redirectUrl.searchParams.set(
    "redirect_uri",
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gmail/callback`
  );
  redirectUrl.searchParams.set("response_type", "code");
  redirectUrl.searchParams.set(
    "scope",
    "https://www.googleapis.com/auth/gmail.readonly"
  );
  redirectUrl.searchParams.set("state", state);
  redirectUrl.searchParams.set("access_type", "offline");
  redirectUrl.searchParams.set("prompt", "consent");

  console.log("Redirecting to Google OAuth:", redirectUrl.toString());
  return NextResponse.redirect(redirectUrl.toString());
}
