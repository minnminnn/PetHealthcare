import { AppointmentsManager } from "@/components/care/AppointmentsManager";
export default function AppointmentsPage({
  searchParams,
}: {
  searchParams: { clinicId?: string; vetId?: string };
}) {
  return (
    <AppointmentsManager
      initialClinicId={searchParams.clinicId}
      initialVetId={searchParams.vetId}
    />
  );
}
