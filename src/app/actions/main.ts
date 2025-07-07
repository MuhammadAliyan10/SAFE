"use server";
import { prismaClient } from "@/lib/prismaClient";
import {
  Currency,
  InvoiceStatus,
  PaymentStatus,
  ThreatType,
} from "@prisma/client";
import { redis } from "@/lib/redis";
import { z } from "zod";

interface Project {
  id: string;
  name: string;
  description: string;
  service: string;
  createdAt: string;
  lastModified: string;
}

// Overview Dashboard Data Interfaces
interface OverviewData {
  project: Project;
  emailMetrics: EmailMetrics;
  invoiceMetrics: InvoiceMetrics;
  clientMetrics: ClientMetrics;
  expenseMetrics: ExpenseMetrics;
  taxMetrics: TaxMetrics;
  documentMetrics: DocumentMetrics;
  paymentMetrics: PaymentMetrics;
  securityMetrics: SecurityMetrics;
  cashFlowMetrics: CashFlowMetrics;
  recentActivity: RecentActivity[];
}

interface EmailMetrics {
  totalEmails: number;
  threatCounts: { type: string; count: number }[];
  emailActivity: { date: string; count: number }[];
  securityScore: number;
  hasGmailConnected: boolean;
}

interface InvoiceMetrics {
  totalInvoices: number;
  totalAmount: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  currencyBreakdown: { currency: string; amount: number }[];
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    clientName: string;
    amount: number;
    currency: string;
    status: string;
    dueDate: string;
  }>;
}

interface ClientMetrics {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  overdueClients: number;
  topClients: Array<{
    id: string;
    name: string;
    totalInvoiced: number;
    totalPaid: number;
    currency: string;
  }>;
}

interface ExpenseMetrics {
  totalExpenses: number;
  totalAmount: number;
  categoryBreakdown: { category: string; amount: number }[];
  monthlyExpenses: { month: string; amount: number }[];
  recentExpenses: Array<{
    id: string;
    category: string;
    amount: number;
    currency: string;
    description: string;
    date: string;
  }>;
}

interface TaxMetrics {
  totalTaxes: number;
  totalAmount: number;
  upcomingDue: number;
  fbrTaxes: number;
  taxBreakdown: { type: string; amount: number }[];
  recentTaxes: Array<{
    id: string;
    type: string;
    amount: number;
    currency: string;
    dueDate: string;
  }>;
}

interface DocumentMetrics {
  totalDocuments: number;
  secureDocuments: number;
  sharedDocuments: number;
  typeBreakdown: { type: string; count: number }[];
  recentDocuments: Array<{
    id: string;
    type: string;
    fileName: string;
    uploadDate: string;
    isSecure: boolean;
  }>;
}

interface PaymentMetrics {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  totalAmount: number;
  methodBreakdown: { method: string; amount: number }[];
  recentPayments: Array<{
    id: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    date: string;
  }>;
}

interface SecurityMetrics {
  totalThreats: number;
  resolvedThreats: number;
  activeThreats: number;
  threatBreakdown: { type: string; count: number }[];
  securityScore: number;
  recentThreats: Array<{
    id: string;
    type: string;
    description: string;
    resolved: boolean;
    date: string;
  }>;
}

interface CashFlowMetrics {
  currentBalance: number;
  predictedAmount: number;
  riskLevel: string;
  monthlyForecast: { month: string; amount: number }[];
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

const DASHBOARD_CACHE_TTL = 60 * 60 * 4; // 4 hours in seconds

const DashboardInputSchema = z.object({
  userId: z.string(),
  projectId: z.string(),
  forceRefresh: z.boolean().optional().default(false),
});

export type DashboardMVPData = {
  overview: any;
  invoices: any;
  expenses: any;
  documents: any;
};

export async function fetchDashboardMVPData(
  input: z.infer<typeof DashboardInputSchema>
): Promise<DashboardMVPData> {
  const { userId, projectId, forceRefresh } = DashboardInputSchema.parse(input);
  const cacheKey = `dashboard:${userId}:${projectId}`;

  if (!forceRefresh) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // If cache is corrupted, ignore and refetch
      }
    }
  }

  // Fetch all dashboard data in parallel using real dynamic data
  const overview = await fetchOverviewData(userId, projectId);
  // For MVP, invoices, expenses, and documents can be extracted from overview
  const invoices = overview.invoiceMetrics;
  const expenses = overview.expenseMetrics;
  const documents = overview.documentMetrics;

  const data: DashboardMVPData = { overview, invoices, expenses, documents };
  await redis.set(cacheKey, JSON.stringify(data), "EX", DASHBOARD_CACHE_TTL);
  return data;
}

export async function fetchProjectInformation(
  projectId: string
): Promise<Project> {
  try {
    const project = await prismaClient.project.findFirst({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      service: project.type,
      createdAt: project.createdAt.toISOString().split("T")[0],
      lastModified: project.updatedAt.toISOString().split("T")[0],
    };
  } catch (error) {
    console.error("Failed to fetch project:", error);
    throw new Error("Unable to fetch project");
  }
}

export async function fetchOverviewData(
  userId: string,
  projectId: string
): Promise<OverviewData> {
  try {
    // Fetch project details
    const project = await fetchProjectInformation(projectId);

    // Fetch email metrics
    const emailSetting = await prismaClient.emailSetting.findFirst({
      where: { userId, provider: "Gmail" },
    });

    const emails = await prismaClient.email.findMany({
      where: { userId, projectId },
      orderBy: { date: "desc" },
    });

    const threatLogs = await prismaClient.threatLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Calculate email metrics
    const emailThreatCounts = threatLogs.reduce((acc, threat) => {
      acc[threat.type] = (acc[threat.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const emailActivity = emails.reduce((acc, email) => {
      const date = email.date.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalThreats = Object.values(emailThreatCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    const securityScore =
      emails.length > 0
        ? ((emails.length - totalThreats) / emails.length) * 100
        : 100;

    const emailMetrics: EmailMetrics = {
      totalEmails: emails.length,
      threatCounts: Object.entries(emailThreatCounts).map(([type, count]) => ({
        type,
        count,
      })),
      emailActivity: Object.entries(emailActivity).map(([date, count]) => ({
        date,
        count,
      })),
      securityScore: Math.round(securityScore),
      hasGmailConnected: !!emailSetting?.oauthToken,
    };

    // Fetch invoice metrics
    const invoices = await prismaClient.invoice.findMany({
      where: { userId },
      include: { client: true },
      orderBy: { createdAt: "desc" },
    });

    const invoiceMetrics: InvoiceMetrics = {
      totalInvoices: invoices.length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
      paidInvoices: invoices.filter((inv) => inv.status === "PAID").length,
      pendingInvoices: invoices.filter((inv) => inv.status === "SENT").length,
      overdueInvoices: invoices.filter((inv) => inv.status === "OVERDUE")
        .length,
      currencyBreakdown: Object.entries(
        invoices.reduce((acc, inv) => {
          acc[inv.currency] = (acc[inv.currency] || 0) + inv.amount;
          return acc;
        }, {} as Record<string, number>)
      ).map(([currency, amount]) => ({ currency, amount: Number(amount) })),
      recentInvoices: invoices.slice(0, 5).map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.client.name,
        amount: inv.amount,
        currency: inv.currency,
        status: inv.status,
        dueDate: inv.dueDate.toISOString().split("T")[0],
      })),
    };

    // Fetch client metrics
    const clients = await prismaClient.client.findMany({
      where: { userId },
      include: { invoices: true },
    });

    const clientMetrics: ClientMetrics = {
      totalClients: clients.length,
      activeClients: clients.filter((c) => c.status === "ACTIVE").length,
      inactiveClients: clients.filter((c) => c.status === "INACTIVE").length,
      overdueClients: clients.filter((c) => c.status === "OVERDUE").length,
      topClients: clients
        .map((client) => ({
          id: client.id,
          name: client.name,
          totalInvoiced: client.invoices.reduce(
            (sum, inv) => sum + inv.amount,
            0
          ),
          totalPaid: client.invoices
            .filter((inv) => inv.status === "PAID")
            .reduce((sum, inv) => sum + inv.amount, 0),
          currency: "PKR", // Default currency
        }))
        .sort((a, b) => b.totalInvoiced - a.totalInvoiced)
        .slice(0, 5),
    };

    // Fetch expense metrics
    const expenses = await prismaClient.expense.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const expenseMetrics: ExpenseMetrics = {
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      categoryBreakdown: Object.entries(
        expenses.reduce((acc, exp) => {
          acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
          return acc;
        }, {} as Record<string, number>)
      ).map(([category, amount]) => ({ category, amount: Number(amount) })),
      monthlyExpenses: Object.entries(
        expenses.reduce((acc, exp) => {
          const month = exp.createdAt.toISOString().slice(0, 7);
          acc[month] = (acc[month] || 0) + exp.amount;
          return acc;
        }, {} as Record<string, number>)
      ).map(([month, amount]) => ({ month, amount: Number(amount) })),
      recentExpenses: expenses.slice(0, 5).map((exp) => ({
        id: exp.id,
        category: exp.category,
        amount: exp.amount,
        currency: exp.currency,
        description: exp.description || "",
        date: exp.createdAt.toISOString().split("T")[0],
      })),
    };

    // Fetch tax metrics
    const taxes = await prismaClient.tax.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const taxMetrics: TaxMetrics = {
      totalTaxes: taxes.length,
      totalAmount: taxes.reduce((sum, tax) => sum + tax.amount, 0),
      upcomingDue: taxes.filter((tax) => tax.dueDate > new Date()).length,
      fbrTaxes: taxes.filter((tax) => tax.type === "FBR").length,
      taxBreakdown: Object.entries(
        taxes.reduce((acc, tax) => {
          acc[tax.type] = (acc[tax.type] || 0) + tax.amount;
          return acc;
        }, {} as Record<string, number>)
      ).map(([type, amount]) => ({ type, amount: Number(amount) })),
      recentTaxes: taxes.slice(0, 5).map((tax) => ({
        id: tax.id,
        type: tax.type,
        amount: tax.amount,
        currency: tax.currency,
        dueDate: tax.dueDate.toISOString().split("T")[0],
      })),
    };

    // Fetch document metrics
    const documents = await prismaClient.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const documentMetrics: DocumentMetrics = {
      totalDocuments: documents.length,
      secureDocuments: documents.filter((doc) => doc.permissions).length,
      sharedDocuments: documents.filter((doc) => !doc.permissions).length,
      typeBreakdown: Object.entries(
        documents.reduce((acc, doc) => {
          acc[doc.type] = (acc[doc.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([type, count]) => ({ type, count: Number(count) })),
      recentDocuments: documents.slice(0, 5).map((doc) => ({
        id: doc.id,
        type: doc.type,
        fileName: doc.fileUrl.split("/").pop() || "Unknown",
        uploadDate: doc.createdAt.toISOString().split("T")[0],
        isSecure: !!doc.permissions,
      })),
    };

    // Fetch payment metrics
    const payments = await prismaClient.paymentHistory.findMany({
      where: { userId },
      include: { paymentMethod: true },
      orderBy: { createdAt: "desc" },
    });

    const paymentMetrics: PaymentMetrics = {
      totalPayments: payments.length,
      successfulPayments: payments.filter((p) => p.status === "SUCCESS").length,
      failedPayments: payments.filter((p) => p.status === "FAILED").length,
      pendingPayments: payments.filter((p) => p.status === "PENDING").length,
      totalAmount: payments
        .filter((p) => p.status === "SUCCESS")
        .reduce((sum, p) => sum + p.amount, 0),
      methodBreakdown: Object.entries(
        payments.reduce((acc, payment) => {
          const method = payment.paymentMethod?.type || "Unknown";
          acc[method] = (acc[method] || 0) + payment.amount;
          return acc;
        }, {} as Record<string, number>)
      ).map(([method, amount]) => ({ method, amount: Number(amount) })),
      recentPayments: payments.slice(0, 5).map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.paymentMethod?.type || "Unknown",
        status: payment.status,
        date: payment.createdAt.toISOString().split("T")[0],
      })),
    };

    // Fetch security metrics
    const securityMetrics: SecurityMetrics = {
      totalThreats: threatLogs.length,
      resolvedThreats: threatLogs.filter((t) => t.resolved).length,
      activeThreats: threatLogs.filter((t) => !t.resolved).length,
      threatBreakdown: Object.entries(emailThreatCounts).map(
        ([type, count]) => ({ type, count })
      ),
      securityScore: Math.round(securityScore),
      recentThreats: threatLogs.slice(0, 5).map((threat) => ({
        id: threat.id,
        type: threat.type,
        description: threat.description,
        resolved: threat.resolved,
        date: threat.createdAt.toISOString().split("T")[0],
      })),
    };

    // Fetch cash flow metrics
    const cashFlow = await prismaClient.cashFlow.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const cashFlowMetrics: CashFlowMetrics = {
      currentBalance: invoiceMetrics.totalAmount - expenseMetrics.totalAmount,
      predictedAmount: cashFlow[0]?.predictedAmount || 0,
      riskLevel: cashFlow[0]?.riskAlert || "Low",
      monthlyForecast: cashFlow.map((cf) => ({
        month: cf.period,
        amount: cf.predictedAmount,
      })),
    };

    // Generate recent activity
    const recentActivity: RecentActivity[] = [
      ...invoices.slice(0, 3).map((inv) => ({
        id: inv.id,
        type: "invoice",
        title: `Invoice ${inv.invoiceNumber} created`,
        description: `Amount: ${inv.currency} ${inv.amount}`,
        timestamp: inv.createdAt.toISOString(),
        icon: "file-text",
      })),
      ...expenses.slice(0, 2).map((exp) => ({
        id: exp.id,
        type: "expense",
        title: `Expense added: ${exp.category}`,
        description: `Amount: ${exp.currency} ${exp.amount}`,
        timestamp: exp.createdAt.toISOString(),
        icon: "receipt",
      })),
      ...threatLogs.slice(0, 2).map((threat) => ({
        id: threat.id,
        type: "security",
        title: `Security threat detected: ${threat.type}`,
        description: threat.description,
        timestamp: threat.createdAt.toISOString(),
        icon: "shield",
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 8);

    return {
      project,
      emailMetrics,
      invoiceMetrics,
      clientMetrics,
      expenseMetrics,
      taxMetrics,
      documentMetrics,
      paymentMetrics,
      securityMetrics,
      cashFlowMetrics,
      recentActivity,
    };
  } catch (error) {
    console.error("Failed to fetch overview data:", error);
    throw new Error("Unable to fetch overview data");
  }
}
