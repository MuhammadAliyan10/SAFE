// /app/api/auth/gmail/callback.ts
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import axios from "axios";
import { storeGmailSettings } from "@/app/actions/gmail/action";
import { queueEmailSync } from "@/lib/queue";

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
  } catch (err) {
    console.error("Invalid state token:", err);
    return NextResponse.json(
      { message: "Invalid state token" },
      { status: 403 }
    );
  }

  if (error) {
    console.error("OAuth error:", error);
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
    console.error("Missing OAuth parameters:", { code, userId, projectId });
    return NextResponse.json(
      { message: "Missing required OAuth parameters" },
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

  try {
    const tokenRequest = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gmail/callback`,
      grant_type: "authorization_code",
    };

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams(tokenRequest).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    console.log("OAuth tokens received:", { access_token, refresh_token });

    const { status, message } = await storeGmailSettings(
      userId,
      access_token,
      refresh_token
    );
    if (status === 200 || status === 201) {
      await queueEmailSync(userId, projectId, access_token);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/apps/${projectId}/dashboard?access_token=${access_token}`
      );
    } else {
      console.error("Failed to store Gmail settings:", message);
      return NextResponse.redirect(
        `${
          process.env.NEXT_PUBLIC_APP_URL
        }/apps/${projectId}/dashboard?error=${encodeURIComponent(
          "Failed to store Gmail settings"
        )}`
      );
    }
  } catch (error: any) {
    console.error(
      "OAuth token exchange error:",
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
