// /app/(protectedRoutes)/apps/[id]/tabs/ImportantTab.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchGmailEmails } from "@/app/actions/gmail/action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mail,
  Trash2,
  Archive,
  Star,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

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

interface ImportantTabProps {
  userId: string;
  projectId: string;
}

const ImportantTab: React.FC<ImportantTabProps> = ({ userId, projectId }) => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const emailsPerPage = 25;

  const { data: emailInsights, isLoading } = useQuery<EmailInsights>({
    queryKey: ["emailInsights", userId, projectId],
    queryFn: () => fetchGmailEmails(userId, projectId),
    enabled: !!userId && !!projectId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({
        queryKey: ["emailInsights", userId, projectId],
      });
      await queryClient.fetchQuery({
        queryKey: ["emailInsights", userId, projectId],
        queryFn: () => fetchGmailEmails(userId, projectId, true),
      });
      toast.success("Important folder refreshed successfully!");
    } catch {
      toast.error("Failed to refresh important folder.");
    }
  };

  const handleAction = async (action: string, emailId: string) => {
    try {
      // Placeholder for actions like archive, delete, mark as not important
      toast.success(`${action} action performed successfully`);
    } catch {
      toast.error(`Failed to perform ${action} action`);
    }
  };

  const handlePageChange = (direction: "next" | "prev") => {
    setCurrentPage((prev) =>
      direction === "next" ? prev + 1 : Math.max(1, prev - 1)
    );
  };

  if (isLoading || !emailInsights || !emailInsights.hasGmail) {
    // Modern skeleton loader for important tab, fully responsive
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center p-2">
        <Card className="w-full shadow-xl bg-card/80 backdrop-blur border border-slate-200 dark:border-slate-800 flex flex-col">
          <CardHeader className="flex-shrink-0 border-b bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse aspect-square" />
                <div className="flex flex-col gap-2">
                  <div className="h-6 rounded bg-slate-200 dark:bg-slate-800 animate-pulse w-32 max-w-full" />
                  <div className="h-4 rounded bg-slate-100 dark:bg-slate-700 animate-pulse w-24 max-w-full" />
                </div>
              </div>
              <div className="flex items-center gap-2 w-full max-w-full">
                <div className="h-10 rounded bg-slate-100 dark:bg-slate-700 animate-pulse flex-1" />
                <div className="h-10 rounded bg-slate-200 dark:bg-slate-800 animate-pulse w-20" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 overflow-hidden p-0 gap-4">
            {/* Skeleton for Email List */}
            <div className="flex-1 p-2 flex flex-col gap-2 min-w-0">
              {[...Array(8)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse w-full"
                >
                  <div className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="h-4 rounded bg-slate-200 dark:bg-slate-700 w-32 max-w-full" />
                    <div className="h-3 rounded bg-slate-100 dark:bg-slate-800 w-48 max-w-full" />
                    <div className="h-3 rounded bg-slate-100 dark:bg-slate-800 w-24 max-w-full" />
                  </div>
                  <div className="h-3 w-12 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const importantEmails = emailInsights.emails.filter((email) =>
    email.labels.includes("IMPORTANT")
  );
  const totalPages = Math.ceil(importantEmails.length / emailsPerPage);
  const paginatedEmails = importantEmails.slice(
    (currentPage - 1) * emailsPerPage,
    currentPage * emailsPerPage
  );

  return (
    <div className="p-6 min-h-screen">
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-primary flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span>Important ({importantEmails.length})</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border-b border-border">
            <div className="flex items-center gap-2 p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction("markAsNotImportant", "")}
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction("delete", "")}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction("archive", "")}
              >
                <Archive className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction("star", "")}
              >
                <Star className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="divide-y divide-border">
            {paginatedEmails.length > 0 ? (
              paginatedEmails.map((email) => (
                <div
                  key={email.id}
                  className="p-4 hover:bg-muted cursor-pointer flex justify-between items-center"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary"
                        />
                        <Star
                          className={`w-4 h-4 ${
                            email.labels.includes("STARRED")
                              ? "text-yellow-500"
                              : "text-muted-foreground"
                          }`}
                        />
                        <span className="font-medium text-sm">
                          {email.from}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(email.date), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">
                      {email.subject || "(No subject)"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {email.snippet}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No important emails found.
              </div>
            )}
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-muted-foreground">
              Showing {paginatedEmails.length} of {importantEmails.length}{" "}
              important emails
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange("prev")}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange("next")}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportantTab;
