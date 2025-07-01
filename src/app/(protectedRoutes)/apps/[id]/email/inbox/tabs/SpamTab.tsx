// /app/(protectedRoutes)/apps/[id]/tabs/SpamTab.tsx
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
  RefreshCw,
  ChevronLeft,
  ChevronRight,
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

interface SpamTabProps {
  userId: string;
  projectId: string;
}

const SpamTab: React.FC<SpamTabProps> = ({ userId, projectId }) => {
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
      toast.success("Spam folder refreshed successfully!");
    } catch {
      toast.error("Failed to refresh spam folder.");
    }
  };

  const handleAction = async (action: string, emailId: string) => {
    try {
      // Placeholder for actions like archive, delete, mark as not spam
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
    return (
      <div className="w-full h-full flex flex-col justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-primary">
              Loading Your Spam Folder
            </h3>
            <p className="text-muted-foreground mt-1">
              Fetching your spam emails...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const spamEmails = emailInsights.emails.filter((email) =>
    email.labels.includes("SPAM")
  );
  const totalPages = Math.ceil(spamEmails.length / emailsPerPage);
  const paginatedEmails = spamEmails.slice(
    (currentPage - 1) * emailsPerPage,
    currentPage * emailsPerPage
  );

  return (
    <div className="p-6 min-h-screen">
      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-primary flex items-center space-x-2">
              <Mail className="w-5 h-5 text-purple-600" />
              <span>Spam ({spamEmails.length})</span>
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
                onClick={() => handleAction("markAsNotSpam", "")}
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
                No spam emails found.
              </div>
            )}
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-muted-foreground">
              Showing {paginatedEmails.length} of {spamEmails.length} spam
              emails
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

export default SpamTab;
