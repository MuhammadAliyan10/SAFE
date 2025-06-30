"use client";

import { useSession } from "@/provider/SessionProvider";
import React, { useState, useEffect } from "react";
import { ChartBar, Mail, Globe, Info } from "lucide-react";
import PageHeader from "@/components/ReuseableComponents/PageHeader";
import TabsComponent from "@/components/ReuseableComponents/TabComponent";
import MainTab from "../tabs/MainTab";
import {
  fetchGmailSettings,
  storeGmailSettings,
  fetchGmailEmails,
} from "@/app/(protectedRoutes)/apps/[id]/dashboard/actions";
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
  const [projectDetails, setProjectDetails] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Query for Gmail settings
  const {
    data: gmailSettings,
    isLoading: isLoadingSettings,
    error: settingsError,
  } = useQuery({
    queryKey: ["gmailSettings", user.id],
    queryFn: () => fetchGmailSettings(user.id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!user.id,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Query for email insights
  const {
    data: insights,
    isLoading: isLoadingInsights,
    error: insightsError,
  } = useQuery({
    queryKey: ["emailInsights", user.id, projectId],
    queryFn: () => fetchGmailEmails(user.id, projectId),
    enabled:
      gmailSettings?.status === 200 &&
      !!gmailSettings?.res &&
      !!user.id &&
      !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
            await queryClient.invalidateQueries({
              queryKey: ["gmailSettings", user.id],
            });
            await queryClient.invalidateQueries({
              queryKey: ["emailInsights", user.id, projectId],
            });
            window.history.replaceState({}, "", `/apps/${projectId}/dashboard`);
          } else {
            toast.error("Failed to store Gmail settings.");
          }
        } catch (error: any) {
          console.error(
            "handleOAuthCallback: Error storing Gmail settings for userId:",
            user.id,
            "Error:",
            error.message
          );
          toast.error("Failed to store Gmail settings. Please try again.");
        }
      }
      if (error) {
        console.error(
          "handleOAuthCallback: OAuth error for userId:",
          user.id,
          "Error:",
          decodeURIComponent(error)
        );
        toast.error(decodeURIComponent(error));
        window.history.replaceState({}, "", `/apps/${projectId}/dashboard`);
      }
    };
    if (searchParams.get("access_token") || searchParams.get("error")) {
      handleOAuthCallback();
    }
  }, [user.id, projectId, searchParams, queryClient]);

  // Handle query errors
  useEffect(() => {
    if (settingsError) {
      console.error(
        "useQuery: Gmail settings error for userId:",
        user.id,
        "Error:",
        settingsError.message
      );
      const message = settingsError.message.includes("network")
        ? "Network error. Please check your connection and try again."
        : settingsError.message.includes("401") ||
          settingsError.message.includes("403")
        ? "Gmail authentication expired. Please reconnect your account."
        : "Failed to load Gmail settings. Please try again.";
      toast.error(message);
    }
    if (insightsError) {
      console.error(
        "useQuery: Email insights error for userId:",
        user.id,
        "projectId:",
        projectId,
        "Error:",
        insightsError.message
      );
      const message = insightsError.message.includes("network")
        ? "Network error. Please check your connection and try again."
        : insightsError.message.includes("401") ||
          insightsError.message.includes("403")
        ? "Gmail authentication expired. Please reconnect your account."
        : "Failed to load email insights. Please try again.";
      toast.error(message);
    }
  }, [settingsError, insightsError, user.id, projectId]);

  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      setIsLoading(true);
      try {
        const res = await fetchProjectInformation(projectId);
        setProjectDetails(res);
      } catch (error) {
        console.error(
          "fetchProjectDetails: Failed to fetch project details for projectId:",
          projectId,
          "Error:",
          error
        );
        toast.error("Error while fetching project details. Try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjectDetails();
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
        component: <EmailInsightsTab userId={user.id} />,
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
        component: <EmailInsightsTab userId={user.id} />,
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
    ? tabsByService[projectDetails.service as ProjectType] ||
      tabsByService[ProjectType.ALL_SERVICES]
    : [];

  const hasGmail = gmailSettings?.status === 200 && !!gmailSettings?.res;

  const handleGmailConnect = async () => {
    try {
      if (!user.id || !projectId) {
        console.error("handleGmailConnect: Missing userId or projectId", {
          userId: user.id,
          projectId,
        });
        throw new Error("User ID or Project ID is missing");
      }
      const redirectUrl = new URL(
        "/api/auth/gmail",
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      );
      redirectUrl.searchParams.set("userId", user.id);
      redirectUrl.searchParams.set("projectId", projectId);
      window.location.href = redirectUrl.toString();
    } catch (error: any) {
      console.error(
        "handleGmailConnect: Error initiating Gmail OAuth for userId:",
        user.id,
        "Error:",
        error.message
      );
      toast.error("Failed to initiate Gmail connection. Please try again.");
    }
  };

  if (isLoading || isLoadingSettings || (hasGmail && isLoadingInsights)) {
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

  if (!hasGmail) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center min-h-[500px] p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-12 h-12 text-purple-600" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">
              Connect Your Email
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Get personalized insights about your email security. We'll help
              you identify threats, track email patterns, and keep your
              communications safe.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-blue-800">
                <p className="font-medium">What we analyze:</p>
                <ul className="mt-1 space-y-1 text-blue-700">
                  <li>• Suspicious emails and phishing attempts</li>
                  <li>• Email activity patterns</li>
                  <li>• Security threat trends</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
            onClick={handleGmailConnect}
          >
            <Globe className="w-5 h-5" />
            <span>Connect Gmail Account</span>
          </button>

          <p className="text-xs text-gray-500">
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
