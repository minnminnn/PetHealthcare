import { AdminManager } from "@/components/care/AdminManager";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
export default async function AdminPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await auth();
  if (session?.user.role !== "SYSTEM_ADMIN")
    redirect(`/${params.locale}/dashboard/owner`);
  return <AdminManager />;
}
