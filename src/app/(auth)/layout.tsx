import { redirect } from "next/navigation";
import React from "react";
import { validateRequest } from "../actions/auth";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = await validateRequest();

  if (session) redirect("/main");

  return <>{children}</>;
}
