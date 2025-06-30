"use server";

import { prismaClient } from "@/lib/prismaClient";
import { google } from "googleapis";

interface GmailSettingsResponse {
  message: string;
  status: number;
  res: {
    id: string;
    provider: string;
    oauthToken: string;
    refreshToken?: string;
    filterConfig?: any;
  } | null;
}

export async function fetchGmailSettings(
  userId: string
): Promise<GmailSettingsResponse> {
  try {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      include: { emailSettings: true },
    });

    if (!user) {
      return {
        message: "No user found",
        status: 404,
        res: null,
      };
    }

    const gmailSettings = user.emailSettings.find(
      (setting) => setting.provider.toLowerCase() === "gmail"
    );

    if (!gmailSettings) {
      return {
        message: "Gmail settings not found",
        status: 404,
        res: null,
      };
    }

    return {
      message: "Gmail settings fetched successfully",
      status: 200,
      res: {
        id: gmailSettings.id,
        provider: gmailSettings.provider,
        oauthToken: gmailSettings.oauthToken,
        refreshToken: gmailSettings.refreshToken || undefined,
        filterConfig: gmailSettings.filterConfig,
      },
    };
  } catch (error) {
    console.error("Failed to fetch Gmail settings:", error);
    return {
      message: "Unable to fetch Gmail settings",
      status: 500,
      res: null,
    };
  }
}

interface StoreGmailSettingsResponse {
  message: string;
  status: number;
  res: {
    id: string;
    provider: string;
    oauthToken: string;
    refreshToken?: string;
    filterConfig?: any;
  } | null;
}

export async function storeGmailSettings(
  userId: string,
  accessToken: string,
  refreshToken?: string
): Promise<StoreGmailSettingsResponse> {
  try {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        message: "No user found",
        status: 404,
        res: null,
      };
    }

    const existingGmailSettings = await prismaClient.emailSetting.findFirst({
      where: { userId, provider: "Gmail" },
    });

    if (existingGmailSettings) {
      const updatedSettings = await prismaClient.emailSetting.update({
        where: { id: existingGmailSettings.id },
        data: {
          oauthToken: accessToken,
          refreshToken:
            refreshToken || existingGmailSettings.refreshToken || null,
          updatedAt: new Date(),
        },
      });

      return {
        message: "Gmail settings updated successfully",
        status: 200,
        res: {
          id: updatedSettings.id,
          provider: updatedSettings.provider,
          oauthToken: updatedSettings.oauthToken,
          refreshToken: updatedSettings.refreshToken || undefined,
          filterConfig: updatedSettings.filterConfig,
        },
      };
    }

    const newSettings = await prismaClient.emailSetting.create({
      data: {
        userId,
        provider: "Gmail",
        oauthToken: accessToken,
        refreshToken: refreshToken || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      message: "Gmail settings created successfully",
      status: 201,
      res: {
        id: newSettings.id,
        provider: newSettings.provider,
        oauthToken: newSettings.oauthToken,
        refreshToken: newSettings.refreshToken || undefined,
        filterConfig: newSettings.filterConfig,
      },
    };
  } catch (error) {
    console.error("Failed to store Gmail settings:", error);
    return {
      message: "Unable to store Gmail settings",
      status: 500,
      res: null,
    };
  }
}

interface EmailInsights {
  hasGmail: boolean;
  emailCount: number;
  threatCounts: { type: string; count: number }[];
  emailActivity: { date: string; count: number }[];
}

export async function fetchGmailEmails(
  userId: string,
  projectId: string,
  forceRefresh: boolean = false
): Promise<EmailInsights> {
  try {
    const emailSetting = await prismaClient.emailSetting.findFirst({
      where: { userId, provider: "Gmail" },
    });

    const hasGmail = !!emailSetting;

    if (!hasGmail || !emailSetting?.oauthToken) {
      return {
        hasGmail: false,
        emailCount: 0,
        threatCounts: [],
        emailActivity: [],
      };
    }

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gmail/callback`
    );
    auth.setCredentials({
      access_token: emailSetting.oauthToken,
      refresh_token: emailSetting.refreshToken || undefined,
    });

    // Check token validity
    const gmail = google.gmail({ version: "v1", auth });
    let isTokenValid = false;
    try {
      await gmail.users.getProfile({ userId: "me" });
      isTokenValid = true;
    } catch (error: any) {
      console.log("Token validation failed:", error.message);
    }

    // Force refresh if requested or token is invalid
    if (forceRefresh || !isTokenValid) {
      if (!emailSetting.refreshToken) {
        console.log("No refresh token available, re-authentication required");
        return {
          hasGmail: false,
          emailCount: 0,
          threatCounts: [],
          emailActivity: [],
        };
      }
      try {
        const { credentials } = await auth.refreshAccessToken();
        if (credentials.access_token) {
          await prismaClient.emailSetting.update({
            where: { id: emailSetting.id },
            data: {
              oauthToken: credentials.access_token,
              refreshToken:
                credentials.refresh_token || emailSetting.refreshToken,
              updatedAt: new Date(),
            },
          });
          auth.setCredentials({
            access_token: credentials.access_token,
            refresh_token:
              credentials.refresh_token || emailSetting.refreshToken,
          });
          console.log("Access token refreshed successfully");
        } else {
          console.log("No access token returned after refresh");
          return {
            hasGmail: false,
            emailCount: 0,
            threatCounts: [],
            emailActivity: [],
          };
        }
      } catch (refreshError: any) {
        console.error("Failed to refresh access token:", refreshError.message);
        return {
          hasGmail: false,
          emailCount: 0,
          threatCounts: [],
          emailActivity: [],
        };
      }
    }

    console.log(
      "Attempting to fetch emails with token:",
      emailSetting.oauthToken.substring(0, 10) + "..."
    );

    try {
      const response = await gmail.users.messages.list({
        userId: "me",
        maxResults: 100,
        q: "from:*",
      });

      const messages = response.data.messages || [];
      const emailCount = messages.length;

      const threatCountsMap: Record<string, number> = {
        PHISHING: 0,
        MALWARE: 0,
        SPAM: 0,
        SUSPICIOUS: 0,
        DDoS: 0,
        RANSOMWARE: 0,
        DATA_LEAK: 0,
      };
      const emailActivityMap: Record<string, number> = {};

      for (const message of messages) {
        const email = await gmail.users.messages.get({
          userId: "me",
          id: message.id!,
          format: "metadata",
          metadataHeaders: ["From", "Subject", "Date"],
        });

        const headers = email.data.payload?.headers || [];
        const dateHeader = headers.find(
          (h) => h.name?.toLowerCase() === "date"
        )?.value;
        const fromHeader = headers.find(
          (h) => h.name?.toLowerCase() === "from"
        )?.value;
        const subjectHeader = headers.find(
          (h) => h.name?.toLowerCase() === "subject"
        )?.value;

        let threatType: string | null = null;
        if (
          subjectHeader?.toLowerCase().includes("urgent") ||
          fromHeader?.includes("noreply")
        ) {
          threatType = "SUSPICIOUS";
        } else if (subjectHeader?.toLowerCase().includes("phishing")) {
          threatType = "PHISHING";
        } else if (subjectHeader?.toLowerCase().includes("spam")) {
          threatType = "SPAM";
        }

        if (threatType && threatCountsMap[threatType] !== undefined) {
          threatCountsMap[threatType]++;
        }

        if (dateHeader) {
          const date = new Date(dateHeader).toISOString().split("T")[0];
          emailActivityMap[date] = (emailActivityMap[date] || 0) + 1;
        }
      }

      const threatCounts = Object.entries(threatCountsMap)
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => ({ type, count }));

      const emailActivity = Object.entries(emailActivityMap).map(
        ([date, count]) => ({
          date,
          count,
        })
      );

      return {
        hasGmail,
        emailCount,
        threatCounts,
        emailActivity: emailActivity.sort((a, b) =>
          a.date.localeCompare(b.date)
        ),
      };
    } catch (apiError: any) {
      console.error("Gmail API error:", apiError.message);
      return {
        hasGmail: false,
        emailCount: 0,
        threatCounts: [],
        emailActivity: [],
      };
    }
  } catch (error: any) {
    console.error("Failed to fetch Gmail emails:", error.message);
    return {
      hasGmail: false,
      emailCount: 0,
      threatCounts: [],
      emailActivity: [],
    };
  }
}
