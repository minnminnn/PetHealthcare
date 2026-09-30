import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await auth();
  if (!session?.user) redirect(`/${params.locale}/login`);
  return children;
}
