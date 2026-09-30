import assert from "node:assert/strict";
import test from "node:test";
import type { PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";
import { appointmentsRouter } from "../api/routers/appointments";
import { petsRouter } from "../api/routers/pets";
import { remindersRouter } from "../api/routers/reminders";
import { notificationsRouter } from "../api/routers/notifications";
const session = (
  id = "owner-a",
  role: Session["user"]["role"] = "OWNER",
): Session => ({
  user: { id, role, name: "Test owner" },
  expires: "2099-01-01",
});
const context = (db: object, user: Session | null = session()) => ({
  db: db as PrismaClient,
  session: user,
  headers: new Headers(),
});
const future = new Date("2090-01-01T10:00:00Z");
const booking = {
  petId: "pet-a",
  clinicId: "clinic-a",
  scheduledAt: future,
  durationMinutes: 30,
};
function bookingDb(
  overrides: { pet?: boolean; vet?: boolean; conflict?: boolean } = {},
) {
  let created = 0;
  const tx = {
    pet: {
      findFirst: async () =>
        overrides.pet === false ? null : { id: "pet-a", species: "DOG" },
    },
    clinic: {
      findFirst: async () => ({ id: "clinic-a", specializations: ["DOG"] }),
    },
    vet: {
      findFirst: async () =>
        overrides.vet === false
          ? null
          : { id: "vet-a", specializations: ["DOG"] },
    },
    appointment: {
      findMany: async () =>
        overrides.conflict
          ? [{ scheduledAt: future, durationMinutes: 30 }]
          : [],
      create: async ({ data }: { data: object }) => {
        created++;
        return { id: "appointment", ...data };
      },
    },
  };
  return {
    db: {
      $transaction: async (
        fn: (arg: typeof tx) => unknown,
        opts: { isolationLevel: string },
      ) => {
        assert.equal(opts.isolationLevel, "Serializable");
        return fn(tx);
      },
    },
    created: () => created,
  };
}

test("API forbids anonymous appointment booking before any database access", async () => {
  const caller = appointmentsRouter.createCaller(context({}, null));
  await assert.rejects(caller.book(booking), { code: "UNAUTHORIZED" });
});
test("booking API prevents foreign/inactive pets, unrelated vets and overlapping slots", async () => {
  for (const [overrides, code] of [
    [{ pet: false }, "NOT_FOUND"],
    [{ vet: false }, "BAD_REQUEST"],
    [{ conflict: true }, "CONFLICT"],
  ] as const) {
    const mock = bookingDb(overrides);
    const caller = appointmentsRouter.createCaller(context(mock.db));
    await assert.rejects(caller.book({ ...booking, vetId: "vet-a" }), { code });
    assert.equal(mock.created(), 0);
  }
});
test("booking API saves a pending appointment owned by the session user", async () => {
  const mock = bookingDb();
  const result = await appointmentsRouter
    .createCaller(context(mock.db))
    .book(booking);
  assert.equal(result.ownerId, "owner-a");
  assert.equal(result.status, "PENDING");
  assert.equal(mock.created(), 1);
});
test("appointment status API checks the appointment's clinic, not a shared pet relationship", async () => {
  let written = false;
  const db = {
    appointment: {
      findUnique: async () => ({ clinicId: "clinic-b", status: "PENDING" }),
      updateMany: async () => {
        written = true;
        return { count: 1 };
      },
    },
    clinic: {
      findFirst: async ({ where }: { where: { id: string } }) => {
        assert.equal(where.id, "clinic-b");
        return null;
      },
    },
  };
  await assert.rejects(
    appointmentsRouter
      .createCaller(context(db, session("staff-a", "CLINIC_ADMIN")))
      .updateStatus({ appointmentId: "appt-b", status: "CONFIRMED" }),
    { code: "NOT_FOUND" },
  );
  assert.equal(written, false);
});
test("an owner cannot cancel another owner's appointment or cancel a completed visit", async () => {
  for (const appt of [
    { ownerId: "owner-b", status: "PENDING" },
    { ownerId: "owner-a", status: "COMPLETED" },
  ]) {
    const caller = appointmentsRouter.createCaller(
      context({ appointment: { findUnique: async () => appt } }),
    );
    await assert.rejects(caller.cancel({ appointmentId: "appt" }));
  }
});
test("new pet and initial weight history are saved as one nested write", async () => {
  const caller = petsRouter.createCaller(
    context({
      pet: {
        create: async ({
          data,
        }: {
          data: {
            ownerId: string;
            weightHistory: { create: { weight: number } };
          };
        }) => {
          assert.equal(data.ownerId, "owner-a");
          assert.equal(data.weightHistory.create.weight, 4.5);
          return { id: "pet-new" };
        },
      },
    }),
  );
  const result = await caller.create({
    name: "Milo",
    species: "CAT",
    weight: 4.5,
  });
  assert.equal(result.id, "pet-new");
});
test("reminder writes enforce ownership and reject negative recurrence", async () => {
  const caller = remindersRouter.createCaller(
    context({
      pet: { findUnique: async () => ({ ownerId: "owner-b", isActive: true }) },
    }),
  );
  await assert.rejects(
    caller.create({
      petId: "pet-b",
      title: "Checkup",
      type: "HEALTH_CHECKUP",
      dueAt: future,
    }),
    { code: "FORBIDDEN" },
  );
  await assert.rejects(
    caller.create({
      petId: "pet-a",
      title: "Checkup",
      type: "HEALTH_CHECKUP",
      dueAt: future,
      repeatDays: -1,
    }),
    { code: "BAD_REQUEST" },
  );
});
test("notification read state cannot be changed across accounts", async () => {
  const caller = notificationsRouter.createCaller(
    context({
      notification: {
        updateMany: async ({ where }: { where: { userId: string } }) => {
          assert.equal(where.userId, "owner-a");
          return { count: 0 };
        },
      },
    }),
  );
  await assert.rejects(caller.markRead({ id: "notification-b" }), {
    code: "NOT_FOUND",
  });
});
