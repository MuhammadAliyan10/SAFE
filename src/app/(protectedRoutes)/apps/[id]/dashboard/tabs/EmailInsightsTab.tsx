"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
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
import { Loader2 } from "lucide-react";
import {
  fetchGmailSettings,
  fetchEmailInsights,
  storeGmailSettings,
} from "../actions";

interface EmailInsights {
  hasGmail: boolean;
  emailCount: number;
  threatCounts: { type: string; count: number }[];
  emailActivity: { date: string; count: number }[];
}

interface EmailInsightsTabProps {
  userId: string;
}

const EmailInsightsTab: React.FC<EmailInsightsTabProps> = ({ userId }) => {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const [hasGmail, setHasGmail] = useState<boolean | null>(null);
  const [insights, setInsights] = useState<EmailInsights | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast.error(decodeURIComponent(error));
    }

    const checkGmailSettings = async () => {
      setIsLoading(true);
      try {
        const { status, res } = await fetchGmailSettings(userId);
        if (status === 200 && res) {
          setHasGmail(true);
          const data = await fetchEmailInsights(userId, projectId);
          setInsights(data);
        } else {
          setHasGmail(false);
        }
      } catch (error) {
        console.error("Error checking Gmail settings:", error);
        toast.error("Failed to load Gmail settings. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    checkGmailSettings();
  }, [userId, projectId, searchParams]);

  const handleGmailConnect = async () => {
    try {
      if (!userId || !projectId) {
        throw new Error("User ID or Project ID is missing");
      }
      const redirectUrl = new URL(
        "/api/auth/gmail",
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      );
      redirectUrl.searchParams.set("userId", userId);
      redirectUrl.searchParams.set("projectId", projectId);
      window.location.href = redirectUrl.toString();
    } catch (error) {
      console.error("Error initiating Gmail OAuth:", error);
      toast.error("Failed to initiate Gmail connection. Please try again.");
    }
  };

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const accessToken = searchParams.get("access_token");
      if (accessToken) {
        try {
          const { status, message } = await storeGmailSettings(
            userId,
            accessToken
          );
          if (status === 200 || status === 201) {
            toast.success(message);
            setHasGmail(true);
            const data = await fetchEmailInsights(userId, projectId);
            setInsights(data);
            window.history.replaceState({}, "", `/apps/${projectId}/dashboard`);
          } else {
            toast.error("Failed to store Gmail settings.");
          }
        } catch (error) {
          console.error("Error storing Gmail settings:", error);
          toast.error("Failed to store Gmail settings. Please try again.");
        }
      }
    };
    handleOAuthCallback();
  }, [userId, projectId, searchParams]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground mt-2">Loading email insights...</p>
      </div>
    );
  }

  if (!hasGmail) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center">
        <div className="text-center leading-1 flex flex-col justify-center items-center">
          <h3 className="text-4xl font-bold">Connect Your Gmail</h3>
          <p className="text-muted-foreground my-3 text-sm">
            To provide personalized email insights and threat detection, please
            connect your Gmail account. <br />
            This will allow us to analyze your emails and provide relevant
            recommendations.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            onClick={handleGmailConnect}
          >
            Connect Gmail
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Emails Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{insights?.emailCount ?? 0}</p>
            <p className="text-sm text-muted-foreground">
              Emails analyzed for insights
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Threat Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {insights?.threatCounts.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={insights.threatCounts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center">
              No threat data available
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Activity Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {insights?.emailActivity.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={insights.emailActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center">
              No email activity data available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailInsightsTab;
