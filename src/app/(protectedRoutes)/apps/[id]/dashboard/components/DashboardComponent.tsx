"use client";

import { useSession } from "@/provider/SessionProvider";
import React, { useState, useEffect } from "react";
import { ChartBar } from "lucide-react";
import PageHeader from "@/components/ReuseableComponents/PageHeader";
import TabsComponent from "@/components/ReuseableComponents/TabComponent";
import MainTab from "../tabs/MainTab";
import { fetchProjectInformation } from "@/app/actions/main";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import EmailInsightsTab from "../tabs/EmailInsightsTab";
import SecurityMetricsTab from "../tabs/SecurityMetricsTab";
import InvoiceAnalyticsTab from "../tabs/InvoiceAnalyticsTab";
import ClientInsightsTab from "../tabs/ClientInsightsTab";
import ExpenseTrackingTab from "../tabs/ExpenseTrackingTab";
import DocumentAnalyticsTab from "../tabs/DocumentAnalyticsTab";

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
  const projectId = params.id as string;
  const [projectDetails, setProjectDetails] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setIsLoading(true);
      try {
        const res = await fetchProjectInformation(projectId);
        setProjectDetails(res);
      } catch (error) {
        console.error("Failed to fetch project details:", error);
        toast.error("Error while fetching project details. Try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjectDetails();
  }, [projectId]);

  const tabsValue = projectDetails
    ? tabsByService[projectDetails.service as ProjectType] ||
      tabsByService[ProjectType.ALL_SERVICES]
    : [];

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
