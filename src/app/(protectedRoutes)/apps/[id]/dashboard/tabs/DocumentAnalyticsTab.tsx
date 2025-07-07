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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Eye,
  Download,
  Share2,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Globe,
  RefreshCw,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Shield,
  Lock,
  Unlock,
  Mail,
  Calendar,
  MapPin,
  Activity,
  Target,
  Zap,
  Search,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOverviewData } from "@/app/actions/main";

interface DocumentAnalyticsTabProps {
  userId: string;
}

const DocumentAnalyticsTab: React.FC<DocumentAnalyticsTabProps> = ({
  userId,
}) => {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["overview", userId, projectId],
    queryFn: () => fetchOverviewData(userId, projectId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const chartColors = {
    primary: theme === "dark" ? "#a78bfa" : "#8b5cf6",
    secondary: theme === "dark" ? "#60a5fa" : "#3b82f6",
    success: theme === "dark" ? "#34d399" : "#10b981",
    warning: theme === "dark" ? "#fbbf24" : "#f59e0b",
    danger: theme === "dark" ? "#f87171" : "#ef4444",
    muted: theme === "dark" ? "#9ca3af" : "#6b7280",
  };

  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({
        queryKey: ["overview", userId, projectId],
      });
      toast.success("Document analytics refreshed successfully!");
    } catch {
      toast.error("Failed to refresh document analytics.");
    }
  };

  // Prepare chart data
  const documentTypeData = data?.documentMetrics?.typeBreakdown
    ? data.documentMetrics.typeBreakdown.map(({ type, count }) => ({
        name: type,
        count: Number(count),
      }))
    : [];

  // Calculate metrics
  const totalDocuments = data?.documentMetrics?.totalDocuments || 0;

  // Calculate security metrics
  const secureDocuments = data?.documentMetrics?.secureDocuments || 0;
  const sharedDocuments = data?.documentMetrics?.sharedDocuments || 0;
  const securityScore =
    totalDocuments > 0 ? (secureDocuments / totalDocuments) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "DELIVERED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "FAILED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "OPENED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "DOWNLOADED":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getDocumentIcon = (type: string) => {
    const iconMap: { [key: string]: any } = {
      PDF: FileText,
      DOC: FileText,
      DOCX: FileText,
      XLS: BarChart3,
      XLSX: BarChart3,
      PPT: Activity,
      PPTX: Activity,
      TXT: FileText,
      CONTRACT: Shield,
      INVOICE: CheckCircle,
      REPORT: BarChart3,
      PROPOSAL: Users,
      AGREEMENT: Shield,
      CERTIFICATE: CheckCircle,
    };
    return iconMap[type.toUpperCase()] || FileText;
  };

  const getSecurityIcon = (securityLevel: string) => {
    switch (securityLevel.toUpperCase()) {
      case "HIGH":
        return <Lock className="h-4 w-4 text-red-600" />;
      case "MEDIUM":
        return <Shield className="h-4 w-4 text-yellow-600" />;
      case "LOW":
        return <Unlock className="h-4 w-4 text-green-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 min-h-screen">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 rounded bg-slate-200 dark:bg-slate-800 mb-2 animate-pulse" />
            <div className="h-4 w-96 rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
          </div>
          <div className="flex space-x-3">
            <div className="h-10 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-20 mb-2 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-3 w-32 rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Documents Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    <div>
                      <div className="h-4 w-32 mb-1 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                      <div className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-6 w-16 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    <div className="h-6 w-20 rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to load document analytics
            </h3>
            <p className="text-muted-foreground mb-4">
              Please try refreshing the page
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Document Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Track document delivery, engagement, and security metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="default"
            className="flex items-center space-x-2 px-4 py-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalDocuments.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {securityScore.toFixed(1)}% secure
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Secure Documents
            </CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {secureDocuments.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((secureDocuments / (totalDocuments || 1)) * 100).toFixed(1)}% of
              total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Shared Documents
            </CardTitle>
            <Share2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {sharedDocuments.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((sharedDocuments / (totalDocuments || 1)) * 100).toFixed(1)}% of
              total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Security Score
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {securityScore.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall document security
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Document Type Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documentTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={documentTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill={chartColors.primary} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No document data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data?.documentMetrics?.recentDocuments?.length ? (
              data.documentMetrics.recentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getDocumentIcon(doc.type)}
                    <div>
                      <div className="font-medium text-primary">
                        {doc.fileName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {doc.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-muted-foreground">
                      {doc.uploadDate}
                    </span>
                    <Badge variant={doc.isSecure ? "default" : "secondary"}>
                      {doc.isSecure ? "Secure" : "Shared"}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground text-center py-8">
                No recent documents found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentAnalyticsTab;
