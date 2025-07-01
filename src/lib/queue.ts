// /app/lib/queue.ts
import Queue from "bull";
import { google } from "googleapis";
import { prismaClient } from "@/lib/prismaClient";
import { queryClient } from "@/lib/react-query";

const emailSyncQueue = new Queue("email-sync", {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
  },
});

emailSyncQueue.process(async (job) => {
  const { userId, projectId, accessToken } = job.data;
  console.log("Processing email sync job:", { userId, projectId });

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gmail/callback`
  );
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth });

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
            headers.find((h) => h.name?.toLowerCase() === "from")?.value || "",
          to: headers.find((h) => h.name?.toLowerCase() === "to")?.value || "",
          subject:
            headers.find((h) => h.name?.toLowerCase() === "subject")?.value ||
            "",
          date:
            headers.find((h) => h.name?.toLowerCase() === "date")?.value || "",
          labels: email.data.labelIds || [],
        });
      }

      nextPageToken = response.data.nextPageToken ?? undefined;
    } while (nextPageToken);

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

    const emailCount = emails.length;
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

    for (const email of emails) {
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

      if (email.date) {
        const date = new Date(email.date).toISOString().split("T")[0];
        emailActivityMap[date] = (emailActivityMap[date] || 0) + 1;
      }
    }

    const threatCounts = Object.entries(threatCountsMap)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({ type, count }));

    const emailActivity = Object.entries(emailActivityMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    queryClient.setQueryData(["emailInsights", userId, projectId], {
      hasGmail: true,
      emailCount,
      threatCounts,
      emailActivity,
      emails,
    });

    console.log("Email sync completed:", { emailCount, threatCounts });
  } catch (error) {
    console.error("Error in email sync job:", error);
    throw error;
  }
});

export async function queueEmailSync(
  userId: string,
  projectId: string,
  accessToken: string
) {
  const existingJobs = await emailSyncQueue.getJobs(["waiting", "active"]);
  const isJobQueued = existingJobs.some(
    (job) => job.data.userId === userId && job.data.projectId === projectId
  );

  if (!isJobQueued) {
    console.log("Queuing email sync job:", { userId, projectId });
    await emailSyncQueue.add("sync-emails", { userId, projectId, accessToken });
  } else {
    console.log("Email sync job already queued for:", { userId, projectId });
  }
}
