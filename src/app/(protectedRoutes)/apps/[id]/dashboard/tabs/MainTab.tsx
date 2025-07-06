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
  DollarSign,
  FileText,
  Lock,
  Globe,
  Smartphone,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileLock,
  CreditCard,
  CheckCircle2,
  TrendingDown,
  Receipt,
  User,
  FileCheck,
  AlertTriangle,
  ShieldCheck,
  Database,
  Cpu,
  Network,
  HardDrive,
  Wifi,
  WifiOff,
  Server,
  Cloud,
  CloudOff,
  Zap,
  Battery,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  CpuIcon,
  MemoryStick,
  HardDriveIcon,
  NetworkIcon,
  WifiIcon,
  ServerIcon,
  CloudIcon,
  DatabaseIcon,
  ActivityIcon,
  Gauge,
  Thermometer,
  GaugeIcon,
  ThermometerIcon,
  Fan,
  FanIcon,
  Power,
  PowerIcon,
  PowerOff,
  PowerOffIcon,
  PowerIcon as PowerOnIcon,
  PowerOffIcon as PowerOffIcon2,
  PowerIcon as PowerOnIcon2,
  PowerOffIcon as PowerOffIcon3,
  PowerIcon as PowerOnIcon3,
  PowerOffIcon as PowerOffIcon4,
  PowerIcon as PowerOnIcon4,
  PowerOffIcon as PowerOffIcon5,
  PowerIcon as PowerOnIcon5,
  PowerOffIcon as PowerOffIcon6,
  PowerIcon as PowerOnIcon6,
  PowerOffIcon as PowerOffIcon7,
  PowerIcon as PowerOnIcon7,
  PowerOffIcon as PowerOffIcon8,
  PowerIcon as PowerOnIcon8,
  PowerOffIcon as PowerOffIcon9,
  PowerIcon as PowerOnIcon9,
  PowerOffIcon as PowerOffIcon10,
  PowerIcon as PowerOnIcon10,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOverviewData } from "@/app/actions/main";

interface MainTabProps {
  userId: string;
}

const MainTab: React.FC<MainTabProps> = ({ userId }) => {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboardData", userId, projectId],
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
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: ["dashboardData", userId, projectId],
      });
      toast.success("Overview data refreshed successfully!");
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error("Failed to refresh overview data.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Prepare chart data
  const emailActivityData = data?.emailMetrics.emailActivity
    ? data.emailMetrics.emailActivity.slice(-7).map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        emails: item.count,
      }))
    : [];

  const threatData = data?.emailMetrics.threatCounts
    ? data.emailMetrics.threatCounts.map((threat) => ({
        name: threat.type,
        value: threat.count,
      }))
    : [];

  const invoiceStatusData = [
    {
      name: "Paid",
      value: data?.invoiceMetrics.paidInvoices || 0,
      color: chartColors.success,
    },
    {
      name: "Pending",
      value: data?.invoiceMetrics.pendingInvoices || 0,
      color: chartColors.warning,
    },
    {
      name: "Overdue",
      value: data?.invoiceMetrics.overdueInvoices || 0,
      color: chartColors.danger,
    },
  ];

  const expenseCategoryData = data?.expenseMetrics.categoryBreakdown
    ? Object.entries(data.expenseMetrics.categoryBreakdown).map(
        ([category, amount]) => ({
          name: category,
          amount: Number(amount),
        })
      )
    : [];

  const paymentMethodData = data?.paymentMetrics.methodBreakdown
    ? Object.entries(data.paymentMetrics.methodBreakdown).map(
        ([method, amount]) => ({
          name: method,
          amount: Number(amount),
        })
      )
    : [];

  const clientPerformanceData = data?.clientMetrics.topClients
    ? data.clientMetrics.topClients.slice(0, 5).map((client) => ({
        name: client.name,
        invoiced: client.totalInvoiced,
        paid: client.totalPaid,
      }))
    : [];

  const recentActivityData = data?.recentActivity || [];

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
      case "ACTIVE":
      case "PAID":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "PENDING":
      case "SENT":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "FAILED":
      case "OVERDUE":
      case "INACTIVE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getActivityIcon = (type: string) => {
    const iconMap: { [key: string]: any } = {
      invoice: FileText,
      expense: Receipt,
      security: Shield,
      email: Mail,
      client: Users,
      payment: CreditCard,
      document: FileCheck,
    };
    return iconMap[type] || Activity;
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

        {/* Recent Activity Skeleton */}
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
              Failed to load overview data
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
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights across all your business services
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRefresh}
            variant="default"
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 transition-colors"
          >
            {isRefreshing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">Refresh</span>
          </Button>
          <Button
            variant="secondary"
            className="flex items-center space-x-2 px-4 py-2 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Settings</span>
          </Button>
          <Button
            variant="outline"
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${data?.invoiceMetrics.totalAmount?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {data?.invoiceMetrics.totalInvoices || 0} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Clients
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data?.clientMetrics.activeClients || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              of {data?.clientMetrics.totalClients || 0} total clients
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
              {data?.emailMetrics.securityScore || 100}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data?.emailMetrics.totalEmails || 0} emails protected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <Receipt className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${data?.expenseMetrics.totalAmount?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {data?.expenseMetrics.totalExpenses || 0} expenses tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Activity (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {emailActivityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={emailActivityData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="emails"
                    stroke={chartColors.primary}
                    fill={chartColors.primary}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No email activity data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoiceStatusData.some((item) => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={invoiceStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {invoiceStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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
                  <p>No invoice data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Client Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Client Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clientPerformanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clientPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="invoiced"
                  fill={chartColors.primary}
                  name="Invoiced"
                />
                <Bar dataKey="paid" fill={chartColors.success} name="Paid" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No client data available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Threats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Threats Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {threatData.length > 0 ? (
              threatData.map((threat, index) => (
                <div
                  key={threat.name}
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{threat.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {threat.value} threats detected
                    </p>
                  </div>
                  <Badge variant="destructive">{threat.value}</Badge>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No security threats detected</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivityData.length > 0 ? (
              recentActivityData.map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <IconComponent className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MainTab;
