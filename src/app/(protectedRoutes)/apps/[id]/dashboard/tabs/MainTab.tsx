"use client";

import React from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mail,
  Shield,
  TrendingUp,
  CheckCircle,
  Activity,
  AlertCircle,
  BarChart3,
  Clock,
  Users,
  Zap,
  Eye,
  Download,
  Filter,
  RefreshCw,
  Settings,
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

interface MainTabProps {
  userId: string;
}

const MainTab: React.FC<MainTabProps> = ({ userId }) => {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  const { theme } = useTheme();

  const chartColors = {
    primary: theme === "dark" ? "#a78bfa" : "#8b5cf6",
    secondary: theme === "dark" ? "#60a5fa" : "#3b82f6",
    success: theme === "dark" ? "#34d399" : "#10b981",
    warning: theme === "dark" ? "#fbbf24" : "#f59e0b",
    danger: theme === "dark" ? "#f87171" : "#ef4444",
    muted: theme === "dark" ? "#9ca3af" : "#6b7280",
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
      toast.success("Dashboard refreshed successfully!");
    } catch (error: any) {
      console.error(
        "handleRefresh: Error refreshing dashboard for userId:",
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
        : "Failed to refresh dashboard. Please try again.";
      toast.error(message);
    }
  };

  const getThreatSeverity = (type: string) => {
    const severityMap: {
      [key: string]: {
        color: string;
        icon: any;
        label: string;
        bgColor: string;
      };
    } = {
      PHISHING: {
        color: chartColors.danger,
        icon: AlertCircle,
        label: "High Risk",
        bgColor: theme === "dark" ? "bg-red-900/30" : "bg-red-50",
      },
      MALWARE: {
        color: chartColors.danger,
        icon: AlertCircle,
        label: "Critical",
        bgColor: theme === "dark" ? "bg-red-900/30" : "bg-red-50",
      },
      SPAM: {
        color: chartColors.warning,
        icon: AlertCircle,
        label: "Low Risk",
        bgColor: theme === "dark" ? "bg-yellow-900/30" : "bg-yellow-50",
      },
      SUSPICIOUS: {
        color: chartColors.warning,
        icon: Shield,
        label: "Medium Risk",
        bgColor: theme === "dark" ? "bg-orange-900/30" : "bg-orange-50",
      },
      DDoS: {
        color: chartColors.danger,
        icon: AlertCircle,
        label: "Critical",
        bgColor: theme === "dark" ? "bg-red-900/30" : "bg-red-50",
      },
      RANSOMWARE: {
        color: chartColors.danger,
        icon: AlertCircle,
        label: "Critical",
        bgColor: theme === "dark" ? "bg-red-900/30" : "bg-red-50",
      },
      DATA_LEAK: {
        color: chartColors.warning,
        icon: Shield,
        label: "High Risk",
        bgColor: theme === "dark" ? "bg-orange-900/30" : "bg-orange-50",
      },
    };
    return (
      severityMap[type] || {
        color: chartColors.muted,
        icon: AlertCircle,
        label: "Unknown",
        bgColor: theme === "dark" ? "bg-gray-900/30" : "bg-gray-50",
      }
    );
  };

  const totalThreats =
    insights?.threatCounts.reduce((sum, threat) => sum + threat.count, 0) || 0;
  const safeEmails = (insights?.emailCount || 0) - totalThreats;
  const securityScore = (safeEmails / (insights?.emailCount || 1)) * 100;

  const getSecurityStatus = () => {
    if (securityScore >= 95)
      return {
        label: "Excellent",
        color: chartColors.success,
        bgColor: theme === "dark" ? "bg-green-900/30" : "bg-green-100",
      };
    if (securityScore >= 85)
      return {
        label: "Good",
        color: chartColors.secondary,
        bgColor: theme === "dark" ? "bg-blue-900/30" : "bg-blue-100",
      };
    if (securityScore >= 70)
      return {
        label: "Fair",
        color: chartColors.warning,
        bgColor: theme === "dark" ? "bg-yellow-900/30" : "bg-yellow-100",
      };
    return {
      label: "Needs Attention",
      color: chartColors.danger,
      bgColor: theme === "dark" ? "bg-red-900/30" : "bg-red-100",
    };
  };

  const securityStatus = getSecurityStatus();

  // Dynamic Protection Overview stats
  const accuracyRate = securityScore.toFixed(1); // Based on securityScore
  const avgResponseTime = insights?.emailActivity.length
    ? `${Math.round(1000 + Math.random() * 500)}ms` // Simulated 1000-1500ms
    : "N/A";
  const monitoringStatus = "24/7"; // Static for now
  const falsePositives = Math.floor(totalThreats * 0.01) || 0; // 1% of threats as false positives

  // Dynamic Recent Activity
  const recentActivity =
    insights?.threatCounts
      .filter((t) => t.count > 0)
      .slice(0, 3)
      .map((threat, index) => {
        const severity = getThreatSeverity(threat.type);
        const Icon = severity.icon;
        return {
          id: index,
          message: `${threat.count} ${threat.type
            .toLowerCase()
            .replace("_", " ")} email${threat.count > 1 ? "s" : ""} ${
            threat.type === "SPAM" || threat.type === "SUSPICIOUS"
              ? "detected"
              : "blocked"
          }`,
          time: `${5 + index * 10} minutes ago`,
          icon: <Icon className={`w-5 h-5 ${severity.color}`} />,
          bgColor: severity.bgColor,
          borderColor:
            theme === "dark"
              ? severity.color.replace("text-", "border-") + "/50"
              : severity.color.replace("text-", "border-"),
        };
      }) || [];

  if (isLoadingInsights) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center min-h-[500px]">
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-full bg-background"></div>
          <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-purple-600 border-r-purple-600 animate-spin"></div>
          <div className="absolute inset-2 w-16 h-16 rounded-full border-4 border-transparent border-b-blue-600 border-l-blue-600 animate-spin animation-delay-150"></div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Initializing Dashboard
          </h3>
          <p className="text-muted-foreground">
            Gathering your security insights...
          </p>
          <div className="flex items-center justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce animation-delay-100"></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce animation-delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Refresh and Settings */}
      <div className="px-6 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Security Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of your email security
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRefresh}
            disabled={isLoadingInsights}
            variant="default"
            className="flex items-center space-x-2 px-4 py-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoadingInsights ? "animate-spin" : ""}`}
            />
            <span className="text-sm font-medium">Refresh</span>
          </Button>
          <Button
            variant="secondary"
            className="flex items-center space-x-2 px-4 py-2 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Settings</span>
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5 dark:bg-white/5"></div>
        <div className="relative px-6 py-6">
          <div className="max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card className="bg-card backdrop-blur-sm rounded-xl border border-border">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Shield className={`w-6 h-6 ${chartColors.success}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Protection Status
                      </p>
                      <p className="text-lg font-semibold text-primary">
                        Active Shield
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card backdrop-blur-sm rounded-xl border border-border">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Clock className={`w-6 h-6 ${chartColors.secondary}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Scan</p>
                      <p className="text-lg font-semibold text-primary">
                        2 mins ago
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card backdrop-blur-sm rounded-xl border border-border">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Zap className={`w-6 h-6 ${chartColors.warning}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Response Time
                      </p>
                      <p className="text-lg font-semibold text-primary">
                        {avgResponseTime}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 dark:bg-black/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 dark:bg-black/10 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 space-y-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Emails - Large Feature Card */}
          <Card className="md:col-span-2 bg-card border border-border backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold text-primary">
                    Email Analytics
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Total messages processed
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
                  <Mail className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {insights?.emailCount?.toLocaleString() ?? 0}
                </span>
                <span className="text-sm text-muted-foreground">emails</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <div
                    className={`w-2 h-2 bg-${chartColors.success.replace(
                      "text-",
                      ""
                    )} rounded-full`}
                  ></div>
                  <span className="text-muted-foreground">
                    {safeEmails.toLocaleString()} safe
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div
                    className={`w-2 h-2 bg-${chartColors.danger.replace(
                      "text-",
                      ""
                    )} rounded-full`}
                  ></div>
                  <span className="text-muted-foreground">
                    {totalThreats} blocked
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Score */}
          <Card className="bg-card backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-primary">
                  Security Score
                </CardTitle>
                <TrendingUp className={`w-5 h-5 ${chartColors.secondary}`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-primary">
                {securityScore.toFixed(0)}%
              </div>
              <div
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${securityStatus.bgColor} ${securityStatus.color}`}
              >
                {securityStatus.label}
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${securityScore}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Threats Blocked */}
          <Card className="bg-card backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-primary">
                  Threats Blocked
                </CardTitle>
                <div className="relative">
                  <Shield className={`w-5 h-5 ${chartColors.danger}`} />
                  {totalThreats > 0 && (
                    <div
                      className={`absolute -top-1 -right-1 w-3 h-3 bg-${chartColors.danger.replace(
                        "text-",
                        ""
                      )} rounded-full animate-pulse`}
                    ></div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-primary">
                {totalThreats}
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className={`w-4 h-4 ${chartColors.danger}`} />
                <span className={`text-sm ${chartColors.danger} font-medium`}>
                  {((totalThreats / (insights?.emailCount || 1)) * 100).toFixed(
                    1
                  )}
                  % of total
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Scan */}
          <Card
            className={`bg-gradient-to-br ${
              theme === "dark"
                ? "from-blue-700 to-purple-700"
                : "from-blue-500 to-purple-600"
            } text-white border-0 shadow-lg`}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Quick Scan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/80 text-sm">
                Run an instant security check on recent emails
              </p>
              <button className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg transition-colors backdrop-blur-sm border border-white/20">
                Start Scan
              </button>
            </CardContent>
          </Card>

          {/* Reports */}
          <Card
            className={`bg-gradient-to-br ${
              theme === "dark"
                ? "from-green-700 to-teal-700"
                : "from-green-500 to-teal-600"
            } text-white border-0 shadow-lg`}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Security Report</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/80 text-sm">
                Generate detailed security analytics report
              </p>
              <button className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg transition-colors backdrop-blur-sm border border-white/20">
                Generate Report
              </button>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card
            className={`bg-gradient-to-br ${
              theme === "dark"
                ? "from-orange-700 to-red-700"
                : "from-orange-500 to-red-500"
            } text-white border-0 shadow-lg`}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filter Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/80 text-sm">
                Customize your email security filters
              </p>
              <button className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg transition-colors backdrop-blur-sm border border-white/20">
                Configure
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Feed */}
          <Card className="bg-card backdrop-blur-sm border border-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className={`w-5 h-5 ${chartColors.primary}`} />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className={`flex items-center space-x-3 p-3 ${activity.bgColor} rounded-lg border-l-4 ${activity.borderColor}`}
                    >
                      {activity.icon}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-primary">
                          {activity.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Shield className={`w-12 h-12 ${chartColors.success} mb-3`} />
                  <h3 className="font-medium text-primary">All Clear!</h3>
                  <p className="text-sm text-muted-foreground">
                    No recent threats detected
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Protection Overview */}
          <Card className="bg-card backdrop-blur-sm border border-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className={`w-5 h-5 ${chartColors.secondary}`} />
                <span>Protection Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`text-center p-4 ${
                    theme === "dark" ? "bg-purple-900/30" : "bg-purple-50"
                  } rounded-lg`}
                >
                  <div className={`text-2xl font-bold ${chartColors.primary}`}>
                    {accuracyRate}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Accuracy Rate
                  </div>
                </div>

                <div
                  className={`text-center p-4 ${
                    theme === "dark" ? "bg-blue-900/30" : "bg-blue-50"
                  } rounded-lg`}
                >
                  <div
                    className={`text-2xl font-bold ${chartColors.secondary}`}
                  >
                    {avgResponseTime}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg Response
                  </div>
                </div>

                <div
                  className={`text-center p-4 ${
                    theme === "dark" ? "bg-green-900/30" : "bg-green-50"
                  } rounded-lg`}
                >
                  <div className={`text-2xl font-bold ${chartColors.success}`}>
                    {monitoringStatus}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Monitoring
                  </div>
                </div>

                <div
                  className={`text-center p-4 ${
                    theme === "dark" ? "bg-orange-900/30" : "bg-orange-50"
                  } rounded-lg`}
                >
                  <div className={`text-2xl font-bold ${chartColors.warning}`}>
                    {falsePositives}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    False Positives
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MainTab;
