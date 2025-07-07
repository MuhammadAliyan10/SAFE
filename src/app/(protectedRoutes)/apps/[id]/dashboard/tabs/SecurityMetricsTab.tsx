"use client";

import React from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  AlertTriangle,
  Info,
  BarChart3,
  RefreshCw,
  Settings,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchGmailEmails } from "@/app/actions/gmail/action";

interface EmailInsights {
  hasGmail: boolean;
  emailCount: number;
  threatCounts: { type: string; count: number }[];
  emailActivity: { date: string; count: number }[];
}

interface SecurityMetricsTabProps {
  userId: string;
}

const SecurityMetricsTab: React.FC<SecurityMetricsTabProps> = ({ userId }) => {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  const { theme } = useTheme();

  const chartColors = {
    primary: "#8b5cf6",
    secondary: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    muted: "#6b7280",
  };

  // Query for email insights
  const {
    data: insights,
    isLoading: isLoadingInsights,
    error: insightsError,
  } = useQuery({
    queryKey: ["emailInsights", userId, projectId],
    queryFn: () => fetchGmailEmails(userId, projectId),
    enabled: !!userId && !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({
        queryKey: ["emailInsights", userId, projectId],
      });
      const data = await queryClient.fetchQuery({
        queryKey: ["emailInsights", userId, projectId],
        queryFn: () => fetchGmailEmails(userId, projectId, true),
      });
      toast.success("Security metrics refreshed successfully!");
    } catch (error: any) {
      console.error(
        "handleRefresh: Error refreshing security metrics for userId:",
        userId,
        "projectId:",
        projectId,
        "Error:",
        error.message
      );
      const message = error.message.includes("network")
        ? "Network error. Please check your connection and try again."
        : error.message.includes("401") || error.message.includes("403")
        ? "Gmail authentication expired. Please reconnect your account."
        : "Failed to refresh security metrics. Please try again.";
      toast.error(message);
    }
  };

  // Export handler (CSV)
  const handleExport = async () => {
    if (!insights) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Emails", insights.emailCount],
      ...insights.threatCounts.map((tc) => [`Threat: ${tc.type}`, tc.count]),
      ...insights.emailActivity.map((ea) => [
        `Email Activity: ${ea.date}`,
        ea.count,
      ]),
      // TODO: Add invoice and document security metrics here when available
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    // @ts-ignore: No types for file-saver
    const fileSaver = await import("file-saver");
    fileSaver.saveAs(blob, "security_metrics_export.csv");
  };

  const getThreatSeverity = (type: string) => {
    const severityMap: {
      [key: string]: { color: string; icon: any; label: string };
    } = {
      PHISHING: {
        color: "text-red-500",
        icon: AlertTriangle,
        label: "High Risk",
      },
      MALWARE: {
        color: "text-red-600",
        icon: AlertTriangle,
        label: "Critical",
      },
      SPAM: { color: "text-yellow-500", icon: Info, label: "Low Risk" },
      SUSPICIOUS: {
        color: "text-orange-500",
        icon: Shield,
        label: "Medium Risk",
      },
      DDoS: { color: "text-red-600", icon: AlertTriangle, label: "Critical" },
      RANSOMWARE: {
        color: "text-red-600",
        icon: AlertTriangle,
        label: "Critical",
      },
      DATA_LEAK: { color: "text-orange-500", icon: Shield, label: "High Risk" },
    };
    return (
      severityMap[type] || {
        color: "text-gray-500",
        icon: Info,
        label: "Unknown",
      }
    );
  };

  const totalThreats =
    insights?.threatCounts.reduce((sum, threat) => sum + threat.count, 0) || 0;
  const spamCount =
    insights?.threatCounts.find((t) => t.type === "SPAM")?.count || 0;
  const phishingCount =
    insights?.threatCounts.find((t) => t.type === "PHISHING")?.count || 0;
  const malwareCount =
    insights?.threatCounts.find((t) => t.type === "MALWARE")?.count || 0;
  const authFailureCount =
    insights?.threatCounts.find((t) => t.type === "SUSPICIOUS")?.count || 0;

  if (isLoadingInsights) {
    // Modern skeleton loader matching the final layout
    return (
      <div className="p-6 space-y-6 min-h-screen">
        {/* Heading Skeleton */}
        <div className="mb-4">
          <div className="h-8 w-64 rounded bg-slate-200 dark:bg-slate-800 mb-2 animate-pulse" />
          <div className="h-4 w-80 rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
        </div>
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className="bg-card border-0 shadow-sm rounded-xl p-5 flex flex-col items-center animate-pulse"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="h-8 w-16 rounded bg-slate-200 dark:bg-slate-700 mb-1" />
              <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
        {/* Main Data Sections Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="bg-card border-0 shadow-sm rounded-xl p-6 flex flex-col animate-pulse"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-700 mb-2" />
                  <div className="h-4 w-40 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="h-48 w-full rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Security Metrics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Detailed metrics on your email security
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleExport}
            variant="default"
            className="flex items-center space-x-2 px-4 py-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-primary">
                Spam Rate
              </CardTitle>
              <Info className="w-5 h-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-primary">
              {((spamCount / (insights?.emailCount || 1)) * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-yellow-500 mt-1">
              {spamCount} emails detected
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-primary">
                Phishing Rate
              </CardTitle>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-primary">
              {((phishingCount / (insights?.emailCount || 1)) * 100).toFixed(1)}
              %
            </div>
            <p className="text-sm text-red-500 mt-1">
              {phishingCount} emails detected
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-primary">
                Malware Rate
              </CardTitle>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-primary">
              {((malwareCount / (insights?.emailCount || 1)) * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-red-600 mt-1">
              {malwareCount} emails detected
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-primary">
                Auth Failure Rate
              </CardTitle>
              <Shield className="w-5 h-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-primary">
              {((authFailureCount / (insights?.emailCount || 1)) * 100).toFixed(
                1
              )}
              %
            </div>
            <p className="text-sm text-orange-500 mt-1">
              {authFailureCount} suspicious emails
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-primary">
                Threat Distribution
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Threat types detected over time
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          {insights?.threatCounts.length ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={insights.threatCounts}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={
                      theme === "light" ? "#f3f4f6" : "oklch(1 0 0 / 10%)"
                    }
                  />
                  <XAxis
                    dataKey="type"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "black",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill={chartColors.primary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>

              <div className="space-y-2">
                {insights.threatCounts.map((threat, index) => {
                  const severity = getThreatSeverity(threat.type);
                  const Icon = severity.icon;
                  return (
                    <div
                      key={threat.type}
                      className="flex items-center justify-between p-2 bg-card border border-border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${severity.color}`} />
                        <span className="text-sm font-medium capitalize">
                          {threat.type.toLowerCase().replace("_", " ")}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${severity.color} bg-opacity-10`}
                        >
                          {severity.label}
                        </span>
                      </div>
                      <span className="text-sm font-semibold">
                        {threat.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Shield className="w-12 h-12 text-green-500 mb-3" />
              <h3 className="font-medium text-primary">All Clear!</h3>
              <p className="text-sm text-muted-foreground">
                No threats detected in your emails
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary flex items-center space-x-2">
            <Info className="w-5 h-5 text-purple-600" />
            <span>Security Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-primary">Stay Protected</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Always verify sender identity before clicking links</li>
                <li>
                  • Be cautious of urgent requests for personal information
                </li>
                <li>• Keep your email software updated</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-primary">Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use strong, unique passwords</li>
                <li>• Enable two-factor authentication</li>
                <li>• Report suspicious emails to your IT team</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Security Card (existing) */}
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-primary">
                Email Security
              </CardTitle>
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* ...existing email security content... */}
          </CardContent>
        </Card>
        {/* Invoice Security Card (placeholder) */}
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-primary">
                Invoice Security
              </CardTitle>
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* TODO: Add invoice security metrics here */}
            <div className="text-muted-foreground text-sm">
              Coming soon: Invoice security metrics
            </div>
          </CardContent>
        </Card>
        {/* Document Security Card (placeholder) */}
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-primary">
                Document Security
              </CardTitle>
              <Shield className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* TODO: Add document security metrics here */}
            <div className="text-muted-foreground text-sm">
              Coming soon: Document security metrics
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityMetricsTab;
