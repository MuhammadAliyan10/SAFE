"use server";

import { prismaClient } from "@/lib/prismaClient";

interface GmailSettingsResponse {
  message: string;
  status: number;
  res: {
    id: string;
    provider: string;
    oauthToken: string;
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
        filterConfig: gmailSettings.filterConfig,
      },
    };
  } catch (error) {
    console.error("Failed to fetch Gmail settings:", error);
    throw new Error("Unable to fetch Gmail settings");
  }
}

interface StoreGmailSettingsResponse {
  message: string;
  status: number;
  res: {
    id: string;
    provider: string;
    oauthToken: string;
    filterConfig?: any;
  } | null;
}

export async function storeGmailSettings(
  userId: string,
  accessToken: string
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
        data: { oauthToken: accessToken, updatedAt: new Date() },
      });

      return {
        message: "Gmail settings updated successfully",
        status: 200,
        res: {
          id: updatedSettings.id,
          provider: updatedSettings.provider,
          oauthToken: updatedSettings.oauthToken,
          filterConfig: updatedSettings.filterConfig,
        },
      };
    }

    const newSettings = await prismaClient.emailSetting.create({
      data: {
        userId,
        provider: "Gmail",
        oauthToken: accessToken,
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
        filterConfig: newSettings.filterConfig,
      },
    };
  } catch (error) {
    console.error("Failed to store Gmail settings:", error);
    throw new Error("Unable to store Gmail settings");
  }
}

interface EmailInsights {
  hasGmail: boolean;
  emailCount: number;
  threatCounts: { type: string; count: number }[];
  emailActivity: { date: string; count: number }[];
}

export async function fetchEmailInsights(
  userId: string,
  projectId: string
): Promise<EmailInsights> {
  try {
    const emailSetting = await prismaClient.emailSetting.findFirst({
      where: { userId, provider: "Gmail" },
    });

    const hasGmail = !!emailSetting;

    if (!hasGmail) {
      return {
        hasGmail: false,
        emailCount: 0,
        threatCounts: [],
        emailActivity: [],
      };
    }

    const emailCount = await prismaClient.notification.count({
      where: {
        userId,
        type: "EMAIL",
        invoice: {
          invoice: { projectId: projectId },
        },
      },
    });

    const threatCounts = await prismaClient.threatLog.groupBy({
      by: ["type"],
      where: {
        userId,
        storefront: {
          project: { id: projectId },
        },
      },
      _count: { _all: true },
    });

    const notifications = await prismaClient.notification.findMany({
      where: {
        userId,
        type: "EMAIL",
        invoice: {
          project: { id: projectId },
        },
      },
      select: { createdAt: true },
    });

    const emailActivityMap = notifications.reduce((acc, { createdAt }) => {
      const date = createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const emailActivity = Object.entries(emailActivityMap).map(
      ([date, count]) => ({
        date,
        count,
      })
    );

    return {
      hasGmail,
      emailCount,
      threatCounts: threatCounts.map((t) => ({
        type: t.type,
        count: t._count._all,
      })),
      emailActivity: emailActivity.sort((a, b) => a.date.localeCompare(b.date)),
    };
  } catch (error) {
    console.error("Failed to fetch email insights:", error);
    throw new Error("Unable to fetch email insights");
  }
}
