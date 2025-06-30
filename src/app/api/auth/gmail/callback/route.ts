import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import axios from "axios";
import { storeGmailSettings } from "../../../../(protectedRoutes)/apps/[id]/dashboard/actions";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  let userId: string | null = null;
  let projectId: string | null = null;

  try {
    const decoded = verify(state || "", process.env.JWT_SECRET || "secret") as {
      state: string;
      userId: string;
      projectId: string;
    };
    userId = decoded.userId;
    projectId = decoded.projectId;
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid state token" },
      { status: 403 }
    );
  }

  if (error) {
    let errorMessage = "Failed to authenticate with Gmail";
    if (error === "access_denied") {
      errorMessage =
        "Access denied: Add your Google account as a test user in Google Cloud Console.";
    }
    return NextResponse.redirect(
      `${
        process.env.NEXT_PUBLIC_APP_URL
      }/apps/${projectId}/dashboard?error=${encodeURIComponent(errorMessage)}`
    );
  }

  if (!code || !userId || !projectId) {
    return NextResponse.json(
      { message: "Missing required OAuth parameters" },
      { status: 400 }
    );
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json(
      { message: "Google OAuth credentials not configured" },
      { status: 500 }
    );
  }

  try {
    const tokenRequest = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gmail/callback`,
      grant_type: "authorization_code",
    };
    console.log("Token request:", {
      ...tokenRequest,
      client_secret: "[REDACTED]",
    });

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      tokenRequest,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token } = tokenResponse.data;

    await storeGmailSettings(userId, access_token);

    const redirectUrl = new URL(
      `${process.env.NEXT_PUBLIC_APP_URL}/apps/${projectId}/dashboard`
    );
    redirectUrl.searchParams.set("access_token", access_token);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error: any) {
    console.error(
      "Failed to complete Gmail OAuth:",
      error.response?.data || error.message
    );
    const errorMessage =
      error.response?.data?.error === "invalid_client"
        ? "Invalid Google OAuth credentials. Check Client ID and Secret in Google Cloud Console."
        : error.response?.data?.error === "access_denied"
        ? "Access denied: Add your Google account as a test user in Google Cloud Console."
        : error.response?.data?.error_description ||
          "Failed to authenticate with Gmail";
    return NextResponse.redirect(
      `${
        process.env.NEXT_PUBLIC_APP_URL
      }/apps/${projectId}/dashboard?error=${encodeURIComponent(errorMessage)}`
    );
  }
}
