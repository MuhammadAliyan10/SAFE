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
  Info,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOverviewData } from "@/app/actions/main";
import { motion, AnimatePresence } from "framer-motion";

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

  const handleExport = async () => {
    if (!data) return;
    const rows = [
      ["Section", "Metric", "Value"],
      ["Emails", "Total Emails", data.emailMetrics.totalEmails],
      ...data.emailMetrics.threatCounts.map((tc) => [
        "Emails",
        `Threat: ${tc.type}`,
        tc.count,
      ]),
      ["Invoices", "Total Invoices", data.invoiceMetrics.totalInvoices],
      ["Invoices", "Paid", data.invoiceMetrics.paidInvoices],
      ["Invoices", "Pending", data.invoiceMetrics.pendingInvoices],
      ["Invoices", "Overdue", data.invoiceMetrics.overdueInvoices],
      ["Documents", "Total Documents", data.documentMetrics.totalDocuments],
      ["Documents", "Secure Documents", data.documentMetrics.secureDocuments],
      ["Documents", "Shared Documents", data.documentMetrics.sharedDocuments],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    // @ts-ignore: No types for file-saver
    const fileSaver = await import("file-saver");
    fileSaver.saveAs(blob, "dashboard_export.csv");
  };

  // Prepare chart data
  const emailActivityData = data?.emailMetrics?.emailActivity?.length
    ? data.emailMetrics.emailActivity.slice(-7).map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        emails: item.count,
      }))
    : [];

  const totalEmails = data?.emailMetrics?.totalEmails ?? 0;

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

  // --- Color palette for world-class SaaS ---
  const cardBg = "bg-card";
  const cardBorder = "border-slate-200 dark:border-slate-800";
  const cardShadow = "shadow-lg";
  const cardHover = "hover:border-indigo-500/60 hover:shadow-xl";
  const iconColor = "text-indigo-600 dark:text-indigo-400";
  const chartPrimary = theme === "dark" ? "#6366f1" : "#4f46e5"; // Indigo
  const chartSecondary = theme === "dark" ? "#818cf8" : "#6366f1";
  const chartWarning = theme === "dark" ? "#fbbf24" : "#f59e0b";
  const chartSuccess = theme === "dark" ? "#34d399" : "#10b981";
  const chartDanger = theme === "dark" ? "#f87171" : "#ef4444";
  const textCard = "text-card-foreground";
  const textMain = "text-foreground";

  // --- Summary Metrics ---
  const summaryMetrics = [
    {
      label: "Total Emails",
      value: totalEmails,
      icon: <Mail className={`w-6 h-6 ${iconColor}`} />,
    },
    {
      label: "Total Invoices",
      value: data?.invoiceMetrics?.totalInvoices ?? 0,
      icon: <FileText className={`w-6 h-6 ${iconColor}`} />,
    },
    {
      label: "Total Documents",
      value: data?.documentMetrics?.totalDocuments ?? 0,
      icon: <FileCheck className={`w-6 h-6 ${iconColor}`} />,
    },
    {
      label: "Total Expenses",
      value: data?.expenseMetrics?.totalExpenses ?? 0,
      icon: <Receipt className={`w-6 h-6 ${iconColor}`} />,
    },
  ];

  // Get project name if available
  const projectName = data?.project?.name || "Project";

  if (isLoading) {
    // Modern skeleton loader matching the dashboard layout
    return (
      <div className="p-6 space-y-6 min-h-screen">
        {/* Heading Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 rounded bg-slate-200 dark:bg-slate-800 mb-2 animate-pulse" />
            <div className="h-4 w-80 rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
          </div>
          <div className="flex space-x-3">
            <div className="h-10 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, idx) => (
            <Card key={idx}>
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
          {[...Array(2)].map((_, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
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
      {/* Heading and Description */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {projectName} Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Your business at a glance. Key metrics, trends, and recent activity.
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
      {/* Summary Cards Row */}
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
              {totalEmails.toLocaleString()}
            </div>
            <p className="text-sm text-purple-600 mt-1">Processed this month</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-primary">
                Total Invoices
              </CardTitle>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-primary">
              {data?.invoiceMetrics?.totalInvoices?.toLocaleString?.() ?? 0}
            </div>
            <p className="text-sm text-blue-600 mt-1">Issued this month</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-primary">
                Total Documents
              </CardTitle>
              <FileCheck className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-primary">
              {data?.documentMetrics?.totalDocuments?.toLocaleString?.() ?? 0}
            </div>
            <p className="text-sm text-green-600 mt-1">Uploaded this month</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-primary">
                Total Expenses
              </CardTitle>
              <Receipt className="w-5 h-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-primary">
              {data?.expenseMetrics?.totalExpenses?.toLocaleString?.() ?? 0}
            </div>
            <p className="text-sm text-red-600 mt-1">Spent this month</p>
          </CardContent>
        </Card>
      </div>
      {/* Main Data Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emails Section */}
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
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            {emailActivityData.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={emailActivityData}
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
                  />
                  <Line
                    type="monotone"
                    dataKey="emails"
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
        {/* Invoices Section */}
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-primary">
                  Invoice Status
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Breakdown of invoice status
                </p>
              </div>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            {invoiceStatusData.some((s) => s.value > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={invoiceStatusData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={
                      theme === "light" ? "#f3f4f6" : "oklch(1 0 0 / 10%)"
                    }
                  />
                  <XAxis
                    dataKey="name"
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
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value">
                    {invoiceStatusData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <FileText className="w-12 h-12 text-primary mb-3" />
                <h3 className="font-medium text-primary">No Invoice Data</h3>
                <p className="text-sm text-muted-foreground">
                  Invoice data will appear here once available
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Documents Section */}
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-primary">
                  Document Types
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Breakdown of document types
                </p>
              </div>
              <FileCheck className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            {data?.documentMetrics?.typeBreakdown &&
            data.documentMetrics.typeBreakdown.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={data.documentMetrics.typeBreakdown}
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
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill={chartColors.success}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <FileCheck className="w-12 h-12 text-primary mb-3" />
                <h3 className="font-medium text-primary">No Document Data</h3>
                <p className="text-sm text-muted-foreground">
                  Document data will appear here once available
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Expenses Section */}
        <Card className="bg-card border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-primary">
                  Monthly Expenses
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Monthly expenses for this project
                </p>
              </div>
              <Receipt className="w-5 h-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            {data?.expenseMetrics?.monthlyExpenses &&
            data.expenseMetrics.monthlyExpenses.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={data.expenseMetrics.monthlyExpenses}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={
                      theme === "light" ? "#f3f4f6" : "oklch(1 0 0 / 10%)"
                    }
                  />
                  <XAxis
                    dataKey="month"
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
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill={chartColors.danger}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Receipt className="w-12 h-12 text-primary mb-3" />
                <h3 className="font-medium text-primary">No Expense Data</h3>
                <p className="text-sm text-muted-foreground">
                  Expense data will appear here once available
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MainTab;
