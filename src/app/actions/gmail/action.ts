// /app/actions/gmail/action.ts
"use server";

import { prismaClient } from "@/lib/prismaClient";
import { google } from "googleapis";
import { queryClient } from "@/lib/react-query";
import { queueEmailSync } from "@/lib/queue";

interface GmailSettingsResponse {
  message: string;
  status: number;
  res: {
    id: string;
    provider: string;
    oauthToken: string;
    refreshToken?: string;
    filterConfig?: any;
    historyId?: string;
  } | null;
}

export async function fetchGmailSettings(
  userId: string
): Promise<GmailSettingsResponse> {
  if (!userId) {
    console.error("Invalid user ID");
    return { message: "Invalid user ID", status: 400, res: null };
  }

  try {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      include: { emailSettings: true },
    });

    if (!user) {
      console.error("User not found:", userId);
      return { message: "User not found", status: 404, res: null };
    }

    const gmailSettings = user.emailSettings.find(
      (setting) => setting.provider.toLowerCase() === "gmail"
    );

    if (!gmailSettings) {
      console.log("No Gmail settings found for user:", userId);
      return { message: "Gmail settings not found", status: 404, res: null };
    }

    console.log("Gmail settings fetched for user:", userId);
    return {
      message: "Gmail settings fetched successfully",
      status: 200,
      res: {
        id: gmailSettings.id,
        provider: gmailSettings.provider,
        oauthToken: gmailSettings.oauthToken,
        refreshToken: gmailSettings.refreshToken || undefined,
        filterConfig: gmailSettings.filterConfig || undefined,
        historyId: gmailSettings.historyId || undefined,
      },
    };
  } catch (error) {
    console.error("Error fetching Gmail settings:", error);
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
  if (!userId || !accessToken) {
    console.error("Invalid user ID or access token:", { userId, accessToken });
    return {
      message: "Invalid user ID or access token",
      status: 400,
      res: null,
    };
  }

  try {
    const user = await prismaClient.user.findUnique({ where: { id: userId } });

    if (!user) {
      console.error("User not found:", userId);
      return { message: "User not found", status: 404, res: null };
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

      console.log("Gmail settings updated for user:", userId);
      return {
        message: "Gmail settings updated successfully",
        status: 200,
        res: {
          id: updatedSettings.id,
          provider: updatedSettings.provider,
          oauthToken: updatedSettings.oauthToken,
          refreshToken: updatedSettings.refreshToken || undefined,
          filterConfig: updatedSettings.filterConfig || undefined,
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

    console.log("Gmail settings created for user:", userId);
    return {
      message: "Gmail settings created successfully",
      status: 201,
      res: {
        id: newSettings.id,
        provider: newSettings.provider,
        oauthToken: newSettings.oauthToken,
        refreshToken: newSettings.refreshToken || undefined,
        filterConfig: newSettings.filterConfig || undefined,
      },
    };
  } catch (error) {
    console.error("Error storing Gmail settings:", error);
    return {
      message: "Unable to store Gmail settings",
      status: 500,
      res: null,
    };
  }
}

interface Email {
  id: string;
  threadId: string;
  snippet: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  labels: string[];
}

interface EmailInsights {
  hasGmail: boolean;
  emailCount: number;
  threatCounts: { type: string; count: number }[];
  emailActivity: { date: string; count: number }[];
  emails: Email[];
}

export async function fetchGmailEmails(
  userId: string,
  projectId: string,
  forceRefresh: boolean = false
): Promise<EmailInsights> {
  if (!userId || !projectId) {
    console.error("Missing userId or projectId:", { userId, projectId });
    return {
      hasGmail: false,
      emailCount: 0,
      threatCounts: [],
      emailActivity: [],
      emails: [],
    };
  }

  try {
    const emailSetting = await prismaClient.emailSetting.findFirst({
      where: { userId, provider: "Gmail" },
    });

    if (!emailSetting || !emailSetting.oauthToken) {
      console.log("No Gmail settings or OAuth token found for user:", userId);
      return {
        hasGmail: false,
        emailCount: 0,
        threatCounts: [],
        emailActivity: [],
        emails: [],
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

    let isTokenValid = false;
    const gmail = google.gmail({ version: "v1", auth });

    try {
      await gmail.users.getProfile({ userId: "me" });
      isTokenValid = true;
      console.log("Access token valid for user:", userId);
    } catch (error: any) {
      console.error("Access token invalid, attempting refresh:", error.message);
    }

    if (!isTokenValid && emailSetting.refreshToken) {
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
          console.log("Access token refreshed for user:", userId);
          isTokenValid = true;
        } else {
          console.error("No access token received after refresh");
          return {
            hasGmail: false,
            emailCount: 0,
            threatCounts: [],
            emailActivity: [],
            emails: [],
          };
        }
      } catch (error) {
        console.error("Failed to refresh access token:", error);
        return {
          hasGmail: false,
          emailCount: 0,
          threatCounts: [],
          emailActivity: [],
          emails: [],
        };
      }
    }

    if (!isTokenValid) {
      console.error("No valid access token available for user:", userId);
      return {
        hasGmail: false,
        emailCount: 0,
        threatCounts: [],
        emailActivity: [],
        emails: [],
      };
    }

    const cachedEmails = await prismaClient.email.findMany({
      where: { userId, projectId },
      orderBy: { date: "desc" },
      take: 100,
    });

    console.log("Fetched cached emails:", cachedEmails.length);

    if (cachedEmails.length === 0 || forceRefresh) {
      console.log("No cached emails or force refresh, fetching from Gmail API");
      let nextPageToken: string | undefined;
      let historyId: string | undefined;
      const emails: any[] = [];

      try {
        const profile = await gmail.users.getProfile({ userId: "me" });
        historyId = profile.data.historyId ?? undefined;
        console.log("Fetched Gmail profile, historyId:", historyId);

        do {
          console.log("Fetching messages, pageToken:", nextPageToken || "none");
          const response = await gmail.users.messages.list({
            userId: "me",
            maxResults: 100,
            pageToken: nextPageToken,
            q: "from:*",
          });

          const messages = response.data.messages || [];
          console.log("Fetched messages:", messages.length);

          for (const message of messages) {
            if (!message.id) continue;
            const email = await gmail.users.messages.get({
              userId: "me",
              id: message.id,
              format: "metadata",
              metadataHeaders: ["From", "To", "Subject", "Date"],
            });

            const headers = email.data.payload?.headers || [];
            emails.push({
              id: email.data.id,
              threadId: email.data.threadId,
              snippet: email.data.snippet,
              from:
                headers.find((h) => h.name?.toLowerCase() === "from")?.value ||
                "",
              to:
                headers.find((h) => h.name?.toLowerCase() === "to")?.value ||
                "",
              subject:
                headers.find((h) => h.name?.toLowerCase() === "subject")
                  ?.value || "",
              date:
                headers.find((h) => h.name?.toLowerCase() === "date")?.value ||
                "",
              labels: email.data.labelIds || [],
            });
          }

          nextPageToken = response.data.nextPageToken || undefined;
        } while (nextPageToken);

        if (emails.length > 0) {
          console.log("Storing emails in database:", emails.length);
          await prismaClient.email.createMany({
            data: emails.map((email) => ({
              id: email.id,
              userId,
              projectId,
              threadId: email.threadId,
              snippet: email.snippet,
              from: email.from,
              to: email.to,
              subject: email.subject,
              date: new Date(email.date),
              labels: email.labels,
            })),
            skipDuplicates: true,
          });

          await prismaClient.emailSetting.updateMany({
            where: { userId, provider: "Gmail" },
            data: { historyId },
          });
        } else {
          console.log("No emails fetched from Gmail API, queuing sync job");
          await queueEmailSync(userId, projectId, emailSetting.oauthToken);
        }
      } catch (error: any) {
        console.error("Error fetching emails from Gmail API:", error.message);
        return {
          hasGmail: true,
          emailCount: 0,
          threatCounts: [],
          emailActivity: [],
          emails: [],
        };
      }
    }

    const updatedEmails = await prismaClient.email.findMany({
      where: { userId, projectId },
      orderBy: { date: "desc" },
      take: 100,
    });

    const emails: Email[] = updatedEmails.map((email) => ({
      id: email.id,
      threadId: email.threadId,
      snippet: email.snippet,
      from: email.from,
      to: email.to,
      subject: email.subject,
      date: email.date.toISOString(),
      labels: email.labels,
    }));

    const emailCount = await prismaClient.email.count({
      where: { userId, projectId },
    });

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

    for (const email of updatedEmails) {
      let threatType: string | null = null;
      if (
        email.subject?.toLowerCase().includes("urgent") ||
        email.from?.includes("noreply")
      ) {
        threatType = "SUSPICIOUS";
      } else if (email.subject?.toLowerCase().includes("phishing")) {
        threatType = "PHISHING";
      } else if (email.subject?.toLowerCase().includes("spam")) {
        threatType = "SPAM";
      }

      if (threatType && threatCountsMap[threatType] !== undefined) {
        threatCountsMap[threatType]++;
      }

      const date = email.date.toISOString().split("T")[0];
      emailActivityMap[date] = (emailActivityMap[date] || 0) + 1;
    }

    const threatCounts = Object.entries(threatCountsMap)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({ type, count }));

    const emailActivity = Object.entries(emailActivityMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    if (emailSetting.historyId && !forceRefresh) {
      console.log("Fetching history since historyId:", emailSetting.historyId);
      try {
        const historyResponse = await gmail.users.history.list({
          userId: "me",
          startHistoryId: emailSetting.historyId,
        });

        const history = historyResponse.data.history || [];
        const updatedEmails: Email[] = [];

        for (const record of history) {
          if (record.messagesAdded) {
            for (const msg of record.messagesAdded) {
              if (!msg.message?.id) continue;
              const email = await gmail.users.messages.get({
                userId: "me",
                id: msg.message.id,
                format: "metadata",
                metadataHeaders: ["From", "To", "Subject", "Date"],
              });

              const headers = email.data.payload?.headers || [];
              updatedEmails.push({
                id: email.data.id!,
                threadId: email.data.threadId!,
                snippet: email.data.snippet!,
                from:
                  headers.find((h) => h.name?.toLowerCase() === "from")
                    ?.value || "",
                to:
                  headers.find((h) => h.name?.toLowerCase() === "to")?.value ||
                  "",
                subject:
                  headers.find((h) => h.name?.toLowerCase() === "subject")
                    ?.value || "",
                date:
                  headers.find((h) => h.name?.toLowerCase() === "date")
                    ?.value || "",
                labels: email.data.labelIds || [],
              });
            }
          }
          if (record.messagesDeleted) {
            const deletedIds = record.messagesDeleted
              .map((msg) => msg.message?.id)
              .filter(Boolean);
            console.log("Deleting emails:", deletedIds);
            await prismaClient.email.deleteMany({
              where: { id: { in: deletedIds as string[] }, userId, projectId },
            });
          }
        }

        if (updatedEmails.length > 0) {
          console.log("Storing updated emails:", updatedEmails.length);
          await prismaClient.email.createMany({
            data: updatedEmails.map((email) => ({
              id: email.id,
              userId,
              projectId,
              threadId: email.threadId,
              snippet: email.snippet,
              from: email.from,
              to: email.to,
              subject: email.subject,
              date: new Date(email.date),
              labels: email.labels,
            })),
            skipDuplicates: true,
          });

          emails.push(...updatedEmails);
        }

        if (historyResponse.data.historyId) {
          console.log("Updating historyId:", historyResponse.data.historyId);
          await prismaClient.emailSetting.update({
            where: { id: emailSetting.id },
            data: { historyId: historyResponse.data.historyId },
          });
        }
      } catch (error) {
        console.error("Error fetching Gmail history:", error);
      }
    }

    const result = {
      hasGmail: true,
      emailCount,
      threatCounts,
      emailActivity,
      emails,
    };
    queryClient.setQueryData(["emailInsights", userId, projectId], result);
    console.log("Email insights fetched:", {
      emailCount,
      emails: emails.length,
    });
    return result;
  } catch (error) {
    console.error("Error fetching Gmail emails:", error);
    return {
      hasGmail: true,
      emailCount: 0,
      threatCounts: [],
      emailActivity: [],
      emails: [],
    };
  }
}

export async function fetchEmailBody(
  userId: string,
  emailId: string
): Promise<string> {
  try {
    const emailSetting = await prismaClient.emailSetting.findFirst({
      where: { userId, provider: "Gmail" },
    });

    if (!emailSetting || !emailSetting.oauthToken) {
      console.error("No Gmail settings or OAuth token found for user:", userId);
      throw new Error("No Gmail settings found");
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

    const gmail = google.gmail({ version: "v1", auth });
    const email = await gmail.users.messages.get({
      userId: "me",
      id: emailId,
      format: "full",
    });

    const parts = email.data.payload?.parts || [];
    let body = "";
    for (const part of parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        body = Buffer.from(part.body.data, "base64").toString("utf-8");
        break;
      }
    }

    console.log("Fetched email body for emailId:", emailId);
    return body;
  } catch (error) {
    console.error("Error fetching email body:", error);
    throw new Error("Failed to fetch email body");
  }
}
