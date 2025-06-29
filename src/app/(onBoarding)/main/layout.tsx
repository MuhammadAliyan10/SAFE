import { validateRequest } from "@/app/actions/auth";
import SessionProvider from "@/provider/SessionProvider";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, session } = await validateRequest();

  if (!session || !user?.id) {
    redirect("/login");
  }

  return (
    <SessionProvider value={{ user, session }}>{children}</SessionProvider>
  );
}
