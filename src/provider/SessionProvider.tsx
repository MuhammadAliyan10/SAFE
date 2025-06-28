"use client";

import { SubscriptionStatus } from "@prisma/client";
import React, { createContext, useContext } from "react";

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

interface SessionContext {
  user: User;
  session: Session;
}

const SessionContext = createContext<SessionContext | null>(null);

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("Session provider is required.");
  }
  return context;
}

export default function SessionProvider({
  children,
  value,
}: React.PropsWithChildren<{ value: SessionContext }>) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
