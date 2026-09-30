import { ClinicManager } from "@/components/care/ClinicManager";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
export default async function ClinicPage({
  params,
}: {
  params: { locale: string };
}) {
  const session = await auth();
  if (!session?.user || session.user.role === "OWNER")
    redirect(`/${params.locale}/dashboard/owner`);
  return <ClinicManager />;
}
