// /app/(protectedRoutes)/apps/[id]/tabs/EmailInsightsTab.tsx
"use client";

import React, { useState } from "react";
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
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mail,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  BarChart3,
  RefreshCw,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchGmailEmails, fetchEmailBody } from "@/app/actions/gmail/action";

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

interface EmailInsightsTabProps {
  userId: string;
  projectId: string;
}

const EmailInsightsTab: React.FC<EmailInsightsTabProps> = ({
  userId,
  projectId,
}) => {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isLoadingBody, setIsLoadingBody] = useState(false);

  const { data: cachedEmails, isLoading } = useQuery<EmailInsights>({
    queryKey: ["emailInsights", userId, projectId],
    queryFn: () => fetchGmailEmails(userId, projectId),
    enabled: !!userId && !!projectId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: emailBody, isLoading: isLoadingEmailBody } = useQuery<string>({
    queryKey: ["emailBody", userId, selectedEmailId],
    queryFn: () => fetchEmailBody(userId, selectedEmailId!),
    enabled: !!selectedEmailId,
  });

  const chartColors = {
    primary: "#8b5cf6",
    secondary: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    muted: "#6b7280",
  };

  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({
        queryKey: ["emailInsights", userId, projectId],
      });
      await queryClient.fetchQuery({
        queryKey: ["emailInsights", userId, projectId],
        queryFn: () => fetchGmailEmails(userId, projectId, true),
      });
      toast.success("Dashboard refreshed successfully!");
    } catch {
      toast.error("Failed to refresh dashboard.");
    }
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

  const handleEmailClick = (emailId: string) => {
    setSelectedEmailId(emailId);
    setIsLoadingBody(true);
  };

  if (isLoading || !cachedEmails || !cachedEmails.hasGmail) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-primary">
              Loading Your Email Dashboard
            </h3>
            <p className="text-muted-foreground mt-1">
              Analyzing your email security...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalThreats = cachedEmails.threatCounts.reduce(
    (sum, threat) => sum + threat.count,
    0
  );
  const safeEmails = cachedEmails.emailCount - totalThreats;

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Email Security Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor your email security and activity
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRefresh}
            variant="default"
            className="flex items-center space-x-2 px-4 py-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-primary">
                Total Emails
              </CardTitle>
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-primary">
              {cachedEmails.emailCount.toLocaleString()}
            </div>
            <p className="text-sm text-purple-600 mt-1">Processed this month</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-primary">
                Safe Emails
              </CardTitle>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-primary">
              {safeEmails.toLocaleString()}
            </div>
            <p className="text-sm text-green-600 mt-1">
              {((safeEmails / (cachedEmails.emailCount || 1)) * 100).toFixed(1)}
              % of total
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-primary">
                Threats Blocked
              </CardTitle>
              <Shield className="w-5 h-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-primary">
              {totalThreats}
            </div>
            <p className="text-sm text-red-600 mt-1">
              {((totalThreats / (cachedEmails.emailCount || 1)) * 100).toFixed(
                1
              )}
              % of total
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-primary">
                Security Score
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-primary">
              {((safeEmails / (cachedEmails.emailCount || 1)) * 100).toFixed(0)}
              %
            </div>
            <p className="text-sm text-blue-600 mt-1">Excellent protection</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-primary">
                  Threat Types
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Security threats detected and blocked
                </p>
              </div>
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            {cachedEmails.threatCounts.length ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={cachedEmails.threatCounts}
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
                  {cachedEmails.threatCounts.map((threat) => {
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
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-primary">
                  Email Activity
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Daily email volume over time
                </p>
              </div>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            {cachedEmails.emailActivity.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={cachedEmails.emailActivity}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={
                      theme === "light" ? "#f3f4f6" : "oklch(1 0 0 / 10%)"
                    }
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke={chartColors.secondary}
                    strokeWidth={3}
                    dot={{ fill: chartColors.secondary, strokeWidth: 2, r: 4 }}
                    activeDot={{
                      r: 6,
                      stroke: chartColors.secondary,
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Mail className="w-12 h-12 text-primary mb-3" />
                <h3 className="font-medium text-primary">No Activity Data</h3>
                <p className="text-sm text-muted-foreground">
                  Email activity will appear here once available
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary flex items-center space-x-2">
            <Mail className="w-5 h-5 text-purple-600" />
            <span>Recent Emails</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cachedEmails.emails.length > 0 ? (
            <div className="space-y-4">
              {cachedEmails.emails.map((email) => (
                <div
                  key={email.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleEmailClick(email.id)}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{email.from}</p>
                      <p className="text-sm text-gray-600">{email.subject}</p>
                      <p className="text-sm text-gray-500">{email.snippet}</p>
                    </div>
                    <p className="text-sm text-gray-400">{email.date}</p>
                  </div>
                  {selectedEmailId === email.id && (
                    <div className="mt-4">
                      {isLoadingEmailBody || isLoadingBody ? (
                        <p className="text-muted-foreground">
                          Loading email content...
                        </p>
                      ) : (
                        <p className="text-sm">
                          {emailBody || "No content available"}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {cachedEmails.emails.length >= 100 && (
                <p className="text-center text-muted-foreground">
                  Fetching more emails...
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No emails available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailInsightsTab;
