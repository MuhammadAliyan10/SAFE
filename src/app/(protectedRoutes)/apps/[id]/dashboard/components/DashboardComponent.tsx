// /app/(protectedRoutes)/apps/[id]/dashboard/page.tsx
"use client";

import { useSession } from "@/provider/SessionProvider";
import React, { useState, useEffect } from "react";
import { ChartBar, Globe, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import PageHeader from "@/components/ReuseableComponents/PageHeader";
import TabsComponent from "@/components/ReuseableComponents/TabComponent";
import MainTab from "../tabs/MainTab";
import {
  fetchGmailEmails,
  fetchGmailSettings,
  storeGmailSettings,
} from "@/app/actions/gmail/action";
import { fetchProjectInformation, fetchOverviewData } from "@/app/actions/main";
import { toast } from "sonner";
import { useParams, useSearchParams } from "next/navigation";
import EmailInsightsTab from "../tabs/EmailInsightsTab";
import SecurityMetricsTab from "../tabs/SecurityMetricsTab";
import InvoiceAnalyticsTab from "../tabs/InvoiceAnalyticsTab";
import ClientInsightsTab from "../tabs/ClientInsightsTab";
import ExpenseTrackingTab from "../tabs/ExpenseTrackingTab";
import DocumentAnalyticsTab from "../tabs/DocumentAnalyticsTab";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Project {
  id: string;
  name: string;
  description: string;
  service: string;
  createdAt: string;
  lastModified: string;
}

enum ProjectType {
  BUSINESS_SECURITY = "BUSINESS_SECURITY",
  INVOICING = "INVOICING",
  DOCUMENT_SECURITY = "DOCUMENT_SECURITY",
  ALL_SERVICES = "ALL_SERVICES",
}

interface Tab {
  name: string;
  value: string;
  component: React.ReactNode;
}

const DashboardComponent = () => {
  const { user } = useSession();
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Central data fetching for all dashboard data
  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    error: dashboardError,
  } = useQuery({
    queryKey: ["dashboardData", user.id, projectId],
    queryFn: () => fetchOverviewData(user.id, projectId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!user.id && !!projectId,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Project information
  const { data: projectDetails, isLoading: isLoadingProject } = useQuery({
    queryKey: ["projectDetails", projectId],
    queryFn: () => fetchProjectInformation(projectId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!projectId,
    refetchOnWindowFocus: false,
  });

  // Gmail integration data
  const { data: gmailIntegration, isLoading: isLoadingGmail } = useQuery({
    queryKey: ["gmailIntegration", user.id],
    queryFn: () => fetchGmailSettings(user.id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!user.id,
    refetchOnWindowFocus: false,
  });

  // Email insights data (only if Gmail is connected)
  const { data: emailData, isLoading: isLoadingEmails } = useQuery({
    queryKey: ["emailData", user.id, projectId],
    queryFn: () => fetchGmailEmails(user.id, projectId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!user.id && !!projectId && !!gmailIntegration?.res,
    refetchOnWindowFocus: false,
  });

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const accessToken = searchParams.get("access_token");
      const error = searchParams.get("error");

      if (accessToken) {
        try {
          const { status, message } = await storeGmailSettings(
            user.id,
            accessToken
          );
          if (status === 200 || status === 201) {
            toast.success(message);
            // Invalidate and refetch all related queries
            await queryClient.invalidateQueries({
              queryKey: ["gmailIntegration", user.id],
            });
            await queryClient.invalidateQueries({
              queryKey: ["emailData", user.id, projectId],
            });
            await queryClient.invalidateQueries({
              queryKey: ["dashboardData", user.id, projectId],
            });
            window.history.replaceState({}, "", `/apps/${projectId}/dashboard`);
          } else {
            toast.error("Failed to store Gmail settings.");
          }
        } catch (error) {
          console.error("Gmail settings error:", error);
          toast.error("Failed to store Gmail settings.");
        }
      }

      if (error) {
        toast.error(decodeURIComponent(error));
        window.history.replaceState({}, "", `/apps/${projectId}/dashboard`);
      }
    };

    if (searchParams.get("access_token") || searchParams.get("error")) {
      handleOAuthCallback();
    }
  }, [user.id, projectId, searchParams, queryClient]);

  // Handle Gmail connection
  const handleGmailConnect = async () => {
    try {
      if (!user.id || !projectId) {
        throw new Error("Missing userId or projectId");
      }
      const redirectUrl = new URL(
        "/api/auth/gmail",
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      );
      redirectUrl.searchParams.set("userId", user.id);
      redirectUrl.searchParams.set("projectId", projectId);
      window.location.href = redirectUrl.toString();
    } catch (error) {
      console.error("Gmail connection error:", error);
      toast.error("Failed to initiate Gmail connection.");
    }
  };

  // Handle data refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Invalidate and refetch all queries
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["dashboardData", user.id, projectId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["emailData", user.id, projectId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["gmailIntegration", user.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["projectDetails", projectId],
        }),
      ]);

      toast.success("Dashboard data refreshed successfully!");
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error("Failed to refresh dashboard data.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Loading state
  if (isLoadingDashboard || isLoadingProject || isLoadingGmail) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center min-h-[500px] p-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-primary">
              Loading Your Dashboard
            </h3>
            <p className="text-muted-foreground">
              Fetching your data and preparing insights...
            </p>
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (dashboardError || !projectDetails) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center min-h-[500px] p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="space-y-3">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-primary">
              Failed to Load Dashboard
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {dashboardError
                ? "There was an error loading your dashboard data. Please try refreshing."
                : "Unable to load project details. Please check your connection and try again."}
            </p>
          </div>
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="rounded-xl flex gap-2 items-center px-4 py-2"
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Retry</span>
            </Button>
            <p className="text-xs text-muted-foreground">
              If the problem persists, please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Define tabs based on project type
  const tabsByService: { [key in ProjectType]: Tab[] } = {
    [ProjectType.BUSINESS_SECURITY]: [
      {
        name: "Overview",
        value: "overview",
        component: <MainTab userId={user.id} />,
      },
      {
        name: "Email Insights",
        value: "email-insights",
        component: <EmailInsightsTab userId={user.id} projectId={projectId} />,
      },
      {
        name: "Security Metrics",
        value: "security-metrics",
        component: <SecurityMetricsTab userId={user.id} />,
      },
    ],
    [ProjectType.INVOICING]: [
      {
        name: "Overview",
        value: "overview",
        component: <MainTab userId={user.id} />,
      },
      {
        name: "Invoice Analytics",
        value: "invoice-analytics",
        component: <InvoiceAnalyticsTab userId={user.id} />,
      },
      {
        name: "Client Insights",
        value: "client-insights",
        component: <ClientInsightsTab userId={user.id} />,
      },
      {
        name: "Expense Tracking",
        value: "expense-tracking",
        component: <ExpenseTrackingTab userId={user.id} />,
      },
    ],
    [ProjectType.DOCUMENT_SECURITY]: [
      {
        name: "Overview",
        value: "overview",
        component: <MainTab userId={user.id} />,
      },
      {
        name: "Document Analytics",
        value: "document-analytics",
        component: <DocumentAnalyticsTab userId={user.id} />,
      },
    ],
    [ProjectType.ALL_SERVICES]: [
      {
        name: "Overview",
        value: "overview",
        component: <MainTab userId={user.id} />,
      },
      {
        name: "Email Insights",
        value: "email-insights",
        component: <EmailInsightsTab userId={user.id} projectId={projectId} />,
      },
      {
        name: "Security Metrics",
        value: "security-metrics",
        component: <SecurityMetricsTab userId={user.id} />,
      },
      {
        name: "Invoice Analytics",
        value: "invoice-analytics",
        component: <InvoiceAnalyticsTab userId={user.id} />,
      },
      // {
      //   name: "Client Insights",
      //   value: "client-insights",
      //   component: <ClientInsightsTab userId={user.id} />,
      // },
      {
        name: "Expense Tracking",
        value: "expense-tracking",
        component: <ExpenseTrackingTab userId={user.id} />,
      },
      {
        name: "Document Analytics",
        value: "document-analytics",
        component: <DocumentAnalyticsTab userId={user.id} />,
      },
    ],
  };

  const tabsValue = projectDetails
    ? tabsByService[projectDetails.service as ProjectType] ||
      tabsByService[ProjectType.ALL_SERVICES]
    : [];

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <PageHeader
          heading="Dashboard"
          icon={<ChartBar className="w-10 h-10 text-primary" />}
          subtitle={`AI-powered insights for ${projectDetails.name}`}
          showSeparator={false}
        />
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isRefreshing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>Refresh</span>
        </Button>
      </div>

      <TabsComponent tabs={tabsValue} defaultValue="overview" />
    </div>
  );
};

export default DashboardComponent;
