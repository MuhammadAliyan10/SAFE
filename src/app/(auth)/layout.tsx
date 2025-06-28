import { redirect } from "next/navigation";
import React from "react";
import { validateRequest } from "../actions/auth";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();
  if (user) redirect("/dashboard");

  return <>{children}</>;
}
