// /app/(protectedRoutes)/apps/[id]/dashboard/page.tsx
"use client";

import { useSession } from "@/provider/SessionProvider";
import React, { useState, useEffect } from "react";
import { ChartBar, Globe } from "lucide-react";
import PageHeader from "@/components/ReuseableComponents/PageHeader";
import TabsComponent from "@/components/ReuseableComponents/TabComponent";
import MainTab from "../tabs/MainTab";
import {
  fetchGmailEmails,
  fetchGmailSettings,
  storeGmailSettings,
} from "@/app/actions/gmail/action";
import { fetchProjectInformation } from "@/app/actions/main";
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

interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
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
  const [projectDetails, setProjectDetails] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { data: gmailSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["gmailSettings", user.id, projectId],
    queryFn: () => fetchGmailSettings(user.id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!user.id && !!projectId,
    refetchOnWindowFocus: false,
  });

  const { data: emailInsights } = useQuery({
    queryKey: ["emailInsights", user.id, projectId],
    queryFn: () => fetchGmailEmails(user.id, projectId),
    enabled: !!user.id && !!projectId && !!gmailSettings?.res,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

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
            await queryClient.invalidateQueries({
              queryKey: ["gmailSettings", user.id, projectId],
            });
            await queryClient.invalidateQueries({
              queryKey: ["emailInsights", user.id, projectId],
            });
            window.history.replaceState({}, "", `/apps/${projectId}/dashboard`);
          } else {
            toast.error("Failed to store Gmail settings.");
          }
        } catch {
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

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setIsLoading(true);
      try {
        const res = await fetchProjectInformation(projectId);
        setProjectDetails(res);
      } catch {
        toast.error("Error while fetching project details.");
      } finally {
        setIsLoading(false);
      }
    };
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

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
      {
        name: "Document Analytics",
        value: "document-analytics",
        component: <DocumentAnalyticsTab userId={user.id} />,
      },
    ],
  };

  const tabsValue = projectDetails
    ? tabsByService[projectDetails.type as ProjectType] ||
      tabsByService[ProjectType.ALL_SERVICES]
    : [];

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
    } catch {
      toast.error("Failed to initiate Gmail connection.");
    }
  };

  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({
        queryKey: ["emailInsights", user.id, projectId],
      });
      await queryClient.fetchQuery({
        queryKey: ["emailInsights", user.id, projectId],
        queryFn: () => fetchGmailEmails(user.id, projectId, true),
      });
      toast.success("Email data refreshed successfully!");
    } catch {
      toast.error("Failed to refresh email data.");
    }
  };

  if (isLoading || isLoadingSettings) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-primary">
              Loading Your Dashboard
            </h3>
            <p className="text-muted-foreground mt-1">
              Preparing your insights...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (
    gmailSettings?.status !== 200 ||
    !gmailSettings?.res ||
    emailInsights?.emailCount === 0
  ) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center min-h-[500px] p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-primary">
              {gmailSettings?.status === 200
                ? "No Emails Found"
                : "Connect Your Email"}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {gmailSettings?.status === 200
                ? "No emails were found in your Gmail account. Try refreshing to fetch new data."
                : "Get personalized insights about your email security. We'll help you identify threats, track email patterns, and keep your communications safe."}
            </p>
          </div>
          <Button
            className="rounded-xl flex gap-2 items-center hover:cursor-pointer px-4 py-2 border border-border bg-primary/10 backdrop-blur-sm text-sm font-normal text-primary hover:bg-primary-20"
            onClick={
              gmailSettings?.status === 200 ? handleRefresh : handleGmailConnect
            }
          >
            <Globe className="w-5 h-5" />
            <span>
              {gmailSettings?.status === 200
                ? "Refresh Email Data"
                : "Connect Gmail Account"}
            </span>
          </Button>
          <p className="text-xs text-muted-foreground">
            We use secure OAuth to connect your account. Your data is encrypted
            and never shared.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        heading="Dashboard"
        icon={<ChartBar className="w-10 h-10 text-primary" />}
        subtitle="AI-powered insights and recommendations tailored for your career growth"
        showSeparator={false}
      />
      <TabsComponent tabs={tabsValue} defaultValue="overview" />
    </div>
  );
};

export default DashboardComponent;
