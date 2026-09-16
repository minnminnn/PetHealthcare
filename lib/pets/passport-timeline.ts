export type PassportTimelineType =
  "medicalRecord" | "vaccination" | "prescription" | "appointment" | "weight";

export type PassportTimelineEvent = {
  id: string;
  sourceId: string;
  type: PassportTimelineType;
  occurredAt: Date;
  title: string;
  description: string | null;
  meta: string | null;
};

type TimelineSources = {
  medicalRecords: Array<{
    id: string;
    visitDate: Date | string;
    title: string;
    description?: string | null;
    clinic?: { name: string } | null;
  }>;
  vaccinations: Array<{
    id: string;
    administeredAt: Date | string;
    vaccineName: string;
    notes?: string | null;
    clinicName?: string | null;
  }>;
  prescriptions: Array<{
    id: string;
    issuedAt: Date | string;
    issuedBy: string;
    instructions?: string | null;
    clinicName?: string | null;
  }>;
  appointments: Array<{
    id: string;
    scheduledAt: Date | string;
    chiefComplaint?: string | null;
    clinic: { name: string };
  }>;
  weightHistory: Array<{
    id: string;
    recordedAt: Date | string;
    weight: number;
    notes?: string | null;
  }>;
};

export function buildPassportTimeline(
  sources: TimelineSources,
): PassportTimelineEvent[] {
  const events: PassportTimelineEvent[] = [
    ...sources.medicalRecords.map((record) => ({
      id: `medicalRecord:${record.id}`,
      sourceId: record.id,
      type: "medicalRecord" as const,
      occurredAt: new Date(record.visitDate),
      title: record.title,
      description: record.description ?? null,
      meta: record.clinic?.name ?? null,
    })),
    ...sources.vaccinations.map((vaccination) => ({
      id: `vaccination:${vaccination.id}`,
      sourceId: vaccination.id,
      type: "vaccination" as const,
      occurredAt: new Date(vaccination.administeredAt),
      title: vaccination.vaccineName,
      description: vaccination.notes ?? null,
      meta: vaccination.clinicName ?? null,
    })),
    ...sources.prescriptions.map((prescription) => ({
      id: `prescription:${prescription.id}`,
      sourceId: prescription.id,
      type: "prescription" as const,
      occurredAt: new Date(prescription.issuedAt),
      title: prescription.issuedBy,
      description: prescription.instructions ?? null,
      meta: prescription.clinicName ?? null,
    })),
    ...sources.appointments.map((appointment) => ({
      id: `appointment:${appointment.id}`,
      sourceId: appointment.id,
      type: "appointment" as const,
      occurredAt: new Date(appointment.scheduledAt),
      title: appointment.chiefComplaint ?? appointment.clinic.name,
      description: appointment.chiefComplaint ? appointment.clinic.name : null,
      meta: appointment.clinic.name,
    })),
    ...sources.weightHistory.map((weight) => ({
      id: `weight:${weight.id}`,
      sourceId: weight.id,
      type: "weight" as const,
      occurredAt: new Date(weight.recordedAt),
      title: `${weight.weight} kg`,
      description: weight.notes ?? null,
      meta: null,
    })),
  ];

  return events
    .filter((event) => !Number.isNaN(event.occurredAt.getTime()))
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
}

export function filterPassportTimeline(
  events: PassportTimelineEvent[],
  types: PassportTimelineType[],
) {
  if (types.length === 0) return events;
  const allowed = new Set(types);
  return events.filter((event) => allowed.has(event.type));
}
