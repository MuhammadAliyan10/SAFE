"use client";

import React, { useState, useEffect } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "../../components/LayoutComponents/Navbar";
import Sidebar from "../../components/LayoutComponents/Sidebar";

import { SubscriptionStatus } from "@prisma/client";
import SessionProvider from "@/provider/SessionProvider";

interface User {
  id: string;
  username: string;
  email: string;
  profileImage: string | null;
  createdAt: Date;
  subscriptions: SubscriptionStatus;
}

interface Session {
  id: string;
  expiresAt: Date;
  fresh: boolean;
  userId: string;
}

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  session: Session;
}

const ClientLayout = ({ children, user, session }: LayoutProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size to determine mobile state
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      // On mobile, ensure sidebar is collapsed by default to avoid initial shift
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      }
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };
  const queryClient = new QueryClient();

  return (
    <SessionProvider value={{ user, session }}>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <Sidebar isExpanded={isExpanded} toggleSidebar={toggleSidebar} />

        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isMobile ? "!ml-0" : isExpanded ? "ml-64" : "ml-16"
          }`}
        >
          {/* Navbar */}
          <div
            className={`fixed top-0 z-20 transition-all duration-300 ${
              isMobile ? "left-0" : isExpanded ? "left-64" : "left-16"
            } right-0`}
          >
            <Navbar
              onMenuToggle={toggleSidebar}
              isSidebarExpanded={isExpanded}
            />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-hidden pt-16 pl-4 pr-4 pb-4 ">
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
};

export default ClientLayout;
