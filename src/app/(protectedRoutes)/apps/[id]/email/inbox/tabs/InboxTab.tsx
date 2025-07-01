// /app/(protectedRoutes)/apps/[id]/tabs/InboxTab.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchGmailEmails, fetchEmailBody } from "@/app/actions/gmail/action";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Mail,
  CheckCircle,
  Trash2,
  Archive,
  Star,
  Reply,
  Forward,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  ArrowLeft,
  Clock,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

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

interface InboxTabProps {
  userId: string;
  projectId?: string;
}

const InboxTab: React.FC<InboxTabProps> = ({
  userId,
  projectId: propProjectId,
}) => {
  const queryClient = useQueryClient();
  const params = useParams();
  const projectId = propProjectId || (params.id as string);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);
  const emailsPerPage = 25;

  const { data: emailInsights, isLoading } = useQuery<EmailInsights>({
    queryKey: ["emailInsights", userId, projectId],
    queryFn: () => {
      if (!userId || !projectId) {
        throw new Error("Missing userId or projectId");
      }
      return fetchGmailEmails(userId, projectId);
    },
    enabled: !!userId && !!projectId,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { data: emailBody, isLoading: isLoadingEmailBody } = useQuery<string>({
    queryKey: ["emailBody", userId, selectedEmailId],
    queryFn: () => {
      if (!userId || !selectedEmailId) {
        throw new Error("Missing userId or selectedEmailId");
      }
      return fetchEmailBody(userId, selectedEmailId);
    },
    enabled: !!selectedEmailId && !!userId,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const handleRefresh = async () => {
    try {
      if (!userId || !projectId) {
        throw new Error("Missing userId or projectId");
      }
      await queryClient.invalidateQueries({
        queryKey: ["emailInsights", userId, projectId],
      });
      await queryClient.fetchQuery({
        queryKey: ["emailInsights", userId, projectId],
        queryFn: () => fetchGmailEmails(userId, projectId, true),
      });
      toast.success("Inbox refreshed successfully!");
    } catch {
      toast.error("Failed to refresh inbox.");
    }
  };

  const handleEmailClick = (emailId: string) => {
    setSelectedEmailId(selectedEmailId === emailId ? null : emailId);
    setIsMobileDetailView(true);
  };

  const handleBackToList = () => {
    setSelectedEmailId(null);
    setIsMobileDetailView(false);
  };

  const handleAction = async (action: string, emailId: string) => {
    try {
      // Placeholder for actions like archive, delete, mark as read
      toast.success(`${action} action performed successfully`);
    } catch {
      toast.error(`Failed to perform ${action} action`);
    }
  };

  const handleSelectEmail = (emailId: string) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(emailId)) {
      newSelected.delete(emailId);
    } else {
      newSelected.add(emailId);
    }
    setSelectedEmails(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEmails.size === paginatedEmails.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(paginatedEmails.map((email) => email.id)));
    }
  };

  const handlePageChange = (direction: "next" | "prev") => {
    setCurrentPage((prev) =>
      direction === "next" ? prev + 1 : Math.max(1, prev - 1)
    );
    setSelectedEmailId(null);
    setIsMobileDetailView(false);
  };

  if (!userId || !projectId) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Error Loading Inbox</h3>
            <p className="text-sm text-muted-foreground">
              Missing user or project information. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && !emailInsights) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <div>
            <h3 className="text-lg font-semibold">Loading Your Inbox</h3>
            <p className="text-sm text-muted-foreground">
              Fetching your emails...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const emails =
    emailInsights?.emails.filter(
      (email) =>
        !email.labels.includes("SENT") &&
        !email.labels.includes("SPAM") &&
        (searchQuery === "" ||
          email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
          email.snippet.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];

  const totalPages = Math.ceil(emails.length / emailsPerPage);
  const paginatedEmails = emails.slice(
    (currentPage - 1) * emailsPerPage,
    currentPage * emailsPerPage
  );

  const selectedEmail = paginatedEmails.find((e) => e.id === selectedEmailId);

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <Card className="flex h-full flex-col border-0 shadow-none">
        {/* Header */}
        <CardHeader className="flex-shrink-0 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Inbox</h2>
                <p className="text-sm text-muted-foreground">
                  {emails.length} {emails.length === 1 ? "email" : "emails"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:w-64"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 overflow-hidden p-0">
          {/* Mobile: Show either list or detail */}
          <div className="flex w-full lg:hidden">
            {!isMobileDetailView ? (
              <EmailList
                emails={paginatedEmails}
                selectedEmails={selectedEmails}
                selectedEmailId={selectedEmailId}
                onEmailClick={handleEmailClick}
                onSelectEmail={handleSelectEmail}
                onSelectAll={handleSelectAll}
                onAction={handleAction}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalEmails={emails.length}
              />
            ) : (
              <EmailDetail
                email={selectedEmail}
                emailBody={emailBody}
                isLoadingEmailBody={isLoadingEmailBody}
                onAction={handleAction}
                onBack={handleBackToList}
                showBackButton={true}
              />
            )}
          </div>

          {/* Desktop: Show both list and detail side by side */}
          <div className="hidden w-full lg:flex">
            <div className="w-1/2 border-r">
              <EmailList
                emails={paginatedEmails}
                selectedEmails={selectedEmails}
                selectedEmailId={selectedEmailId}
                onEmailClick={handleEmailClick}
                onSelectEmail={handleSelectEmail}
                onSelectAll={handleSelectAll}
                onAction={handleAction}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalEmails={emails.length}
              />
            </div>
            <div className="w-1/2">
              {selectedEmailId ? (
                <EmailDetail
                  email={selectedEmail}
                  emailBody={emailBody}
                  isLoadingEmailBody={isLoadingEmailBody}
                  onAction={handleAction}
                  showBackButton={false}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Mail className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Select an email</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose an email from the list to view its contents
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Email List Component
interface EmailListProps {
  emails: Email[];
  selectedEmails: Set<string>;
  selectedEmailId: string | null;
  onEmailClick: (emailId: string) => void;
  onSelectEmail: (emailId: string) => void;
  onSelectAll: () => void;
  onAction: (action: string, emailId: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (direction: "next" | "prev") => void;
  totalEmails: number;
}

const EmailList: React.FC<EmailListProps> = ({
  emails,
  selectedEmails,
  selectedEmailId,
  onEmailClick,
  onSelectEmail,
  onSelectAll,
  onAction,
  currentPage,
  totalPages,
  onPageChange,
  totalEmails,
}) => {
  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex-shrink-0 border-b bg-muted/30 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={
                selectedEmails.size === emails.length && emails.length > 0
              }
              onChange={onSelectAll}
              className="h-4 w-4 rounded border-input"
            />
            <Separator orientation="vertical" className="h-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAction("archive", "")}
              disabled={selectedEmails.size === 0}
              className="h-8 px-2"
            >
              <Archive className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAction("delete", "")}
              disabled={selectedEmails.size === 0}
              className="h-8 px-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAction("markAsRead", "")}
              disabled={selectedEmails.size === 0}
              className="h-8 px-2"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {emails.length > 0 ? (
          <div className="divide-y">
            {emails.map((email) => (
              <div
                key={email.id}
                className={cn(
                  "group flex cursor-pointer items-center space-x-3 p-4 transition-colors hover:bg-muted/50",
                  selectedEmailId === email.id && "bg-muted",
                  email.labels.includes("UNREAD") &&
                    "bg-card border-l-2 border-l-primary"
                )}
                onClick={() => onEmailClick(email.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedEmails.has(email.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    onSelectEmail(email.id);
                  }}
                  className="h-4 w-4 rounded border-input"
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction("star", email.id);
                  }}
                  className="flex-shrink-0"
                >
                  <Star
                    className={cn(
                      "h-4 w-4 transition-colors",
                      email.labels.includes("STARRED")
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground hover:text-yellow-400"
                    )}
                  />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p
                      className={cn(
                        "truncate text-sm",
                        email.labels.includes("UNREAD")
                          ? "font-semibold text-foreground"
                          : "font-medium text-muted-foreground"
                      )}
                    >
                      {email.from}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      {email.labels.includes("ATTACHMENT") && (
                        <Paperclip className="h-3 w-3" />
                      )}
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(email.date), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  <p
                    className={cn(
                      "truncate text-sm",
                      email.labels.includes("UNREAD")
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {email.subject || "(No subject)"}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {email.snippet}
                  </p>

                  {/* Labels */}
                  {email.labels.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {email.labels
                        .filter(
                          (label) =>
                            !["UNREAD", "STARRED", "SENT", "SPAM"].includes(
                              label
                            )
                        )
                        .slice(0, 2)
                        .map((label) => (
                          <Badge
                            key={label}
                            variant="secondary"
                            className="text-xs"
                          >
                            {label.toLowerCase()}
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Mail className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">No emails found</h3>
                <p className="text-sm text-muted-foreground">
                  Your inbox is empty or no emails match your search
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 border-t bg-card p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {emails.length} of {totalEmails} emails
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange("prev")}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange("next")}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Email Detail Component
interface EmailDetailProps {
  email?: Email;
  emailBody?: string;
  isLoadingEmailBody: boolean;
  onAction: (action: string, emailId: string) => void;
  onBack?: () => void;
  showBackButton: boolean;
}

const EmailDetail: React.FC<EmailDetailProps> = ({
  email,
  emailBody,
  isLoadingEmailBody,
  onAction,
  onBack,
  showBackButton,
}) => {
  if (!email) return null;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-card p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {showBackButton && onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="lg:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold leading-tight">
                {email.subject || "(No subject)"}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>From: {email.from}</span>
                <Separator orientation="vertical" className="h-3" />
                <span>To: {email.to}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(email.date).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAction("reply", email.id)}
            >
              <Reply className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAction("forward", email.id)}
            >
              <Forward className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAction("archive", email.id)}
            >
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoadingEmailBody ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="whitespace-pre-wrap break-words">
              {emailBody || "No content available"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxTab;
