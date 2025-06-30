import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { sign } from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const projectId = searchParams.get("projectId");

  if (!userId || !projectId) {
    return NextResponse.json(
      { message: "Missing userId or projectId" },
      { status: 400 }
    );
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json(
      { message: "Google Client ID not configured" },
      { status: 500 }
    );
  }

  const state = randomBytes(16).toString("hex");
  const stateToken = sign(
    { state, userId, projectId },
    process.env.JWT_SECRET || "secret",
    {
      expiresIn: "10m",
    }
  );

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID);
  authUrl.searchParams.set(
    "redirect_uri",
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gmail/callback`
  );
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set(
    "scope",
    "https://www.googleapis.com/auth/gmail.readonly"
  );
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("state", stateToken);

  return NextResponse.redirect(authUrl.toString());
}
