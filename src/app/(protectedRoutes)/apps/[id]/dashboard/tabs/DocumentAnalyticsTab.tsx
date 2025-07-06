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
  FileCheck,
  FileX,
  FileClock,
  FileSearch,
  FileShield,
  FileBarChart,
  FileUser,
  FileGlobe,
  FileActivity,
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
  const documentStatusData = data?.documentMetrics?.statusBreakdown
    ? Object.entries(data.documentMetrics.statusBreakdown).map(
        ([status, count]) => ({
          name: status,
          count: Number(count),
        })
      )
    : [];

  const deliverySuccessData = data?.documentMetrics?.deliverySuccess
    ? Object.entries(data.documentMetrics.deliverySuccess)
        .map(([month, rate]) => ({
          month: new Date(month + "-01").toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          rate: Number(rate),
        }))
        .sort(
          (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
        )
    : [];

  const viewerEngagementData = data?.documentMetrics?.viewerEngagement
    ? Object.entries(data.documentMetrics.viewerEngagement).map(
        ([document, engagement]) => ({
          name: document,
          views: Number(engagement.views),
          downloads: Number(engagement.downloads),
          shares: Number(engagement.shares),
        })
      )
    : [];

  const locationData = data?.documentMetrics?.viewerLocations
    ? Object.entries(data.documentMetrics.viewerLocations).map(
        ([location, count]) => ({
          name: location,
          count: Number(count),
        })
      )
    : [];

  // Calculate metrics
  const totalDocuments = data?.documentMetrics?.totalDocuments || 0;
  const totalDelivered = data?.documentMetrics?.totalDelivered || 0;
  const totalOpened = data?.documentMetrics?.totalOpened || 0;
  const totalDownloads = data?.documentMetrics?.totalDownloads || 0;

  const deliveryRate =
    totalDocuments > 0 ? (totalDelivered / totalDocuments) * 100 : 0;
  const openRate =
    totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
  const downloadRate =
    totalOpened > 0 ? (totalDownloads / totalOpened) * 100 : 0;

  // Calculate security metrics
  const secureDocuments = data?.documentMetrics?.secureDocuments || 0;
  const blockchainVerified = data?.documentMetrics?.blockchainVerified || 0;
  const securityScore =
    totalDocuments > 0
      ? ((secureDocuments + blockchainVerified) / (totalDocuments * 2)) * 100
      : 0;

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
      XLS: FileBarChart,
      XLSX: FileBarChart,
      PPT: FileActivity,
      PPTX: FileActivity,
      TXT: FileText,
      CONTRACT: FileShield,
      INVOICE: FileCheck,
      REPORT: FileBarChart,
      PROPOSAL: FileUser,
      AGREEMENT: FileShield,
      CERTIFICATE: FileCheck,
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
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex space-x-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Documents Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
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
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
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
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Upload Document</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center space-x-2 px-4 py-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export Report</span>
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
              {deliveryRate.toFixed(1)}% delivery rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {openRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {totalOpened} documents opened
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Download Rate</CardTitle>
            <Download className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {downloadRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {totalDownloads} downloads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Security Score
            </CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {securityScore.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {blockchainVerified} blockchain verified
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Document Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documentStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={documentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {documentStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(${index * 60}, 70%, 60%)`}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No document status data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery Success Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Delivery Success Rate Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deliverySuccessData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={deliverySuccessData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke={chartColors.success}
                    strokeWidth={3}
                    dot={{ fill: chartColors.success, strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No delivery data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Viewer Engagement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Viewer Engagement by Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewerEngagementData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={viewerEngagementData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill={chartColors.primary} name="Views" />
                <Bar
                  dataKey="downloads"
                  fill={chartColors.success}
                  name="Downloads"
                />
                <Bar
                  dataKey="shares"
                  fill={chartColors.warning}
                  name="Shares"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No engagement data available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Viewer Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Viewer Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locationData.length > 0 ? (
              locationData.map((location, index) => (
                <div
                  key={location.name}
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 rounded-full bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{location.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {location.count} viewers
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {(
                        (location.count /
                          locationData.reduce(
                            (sum, loc) => sum + loc.count,
                            0
                          )) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No location data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
              data.documentMetrics.recentDocuments.map((document) => {
                const IconComponent = getDocumentIcon(document.type);
                return (
                  <div
                    key={document.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <IconComponent className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{document.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {document.description || "No description"}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {document.type} • {document.size}
                          </span>
                          {getSecurityIcon(document.securityLevel)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(document.status)}>
                            {document.status}
                          </Badge>
                          {document.blockchainVerified && (
                            <Badge variant="outline" className="text-green-600">
                              <Shield className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {document.views} views • {document.downloads}{" "}
                          downloads
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDocumentId(document.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent documents</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentAnalyticsTab;
