import assert from "node:assert/strict";
import test from "node:test";
import {
  assertFutureBooking,
  assertTransition,
  bookingSchema,
  clinicDayRange,
  overlaps,
} from "./appointments";
import { refreshAccountToken } from "./session";

const at = (time: string) => new Date(`2030-01-01T${time}:00+07:00`);
test("booking rejects invalid durations and unsupported remote sessions", () => {
  const valid = { petId: "pet", clinicId: "clinic", scheduledAt: at("10:00") };
  assert.equal(bookingSchema.safeParse(valid).success, true);
  for (const durationMinutes of [-30, 0, 14, 30.5, 181])
    assert.equal(
      bookingSchema.safeParse({ ...valid, durationMinutes }).success,
      false,
    );
  assert.equal(
    bookingSchema.safeParse({ ...valid, type: "TELE_VET_VIDEO" }).success,
    false,
  );
  assert.throws(() => assertFutureBooking(at("10:00"), at("10:00")));
  assert.throws(() => assertFutureBooking(at("09:59"), at("10:00")));
});
test("overlap includes containing intervals but permits adjacent appointments", () => {
  assert.equal(overlaps(at("10:00"), 30, at("10:15"), 30), true);
  assert.equal(overlaps(at("10:00"), 30, at("09:00"), 120), true);
  assert.equal(overlaps(at("10:00"), 30, at("10:30"), 30), false);
  assert.equal(overlaps(at("10:00"), 30, at("09:30"), 30), false);
});
test("appointments cannot be completed before starting or reopened after cancellation", () => {
  assertTransition("PENDING", "CONFIRMED");
  assertTransition("CONFIRMED", "IN_PROGRESS");
  assertTransition("IN_PROGRESS", "COMPLETED");
  for (const [from, to] of [
    ["PENDING", "COMPLETED"],
    ["COMPLETED", "CANCELLED"],
    ["CANCELLED", "CONFIRMED"],
    ["IN_PROGRESS", "CANCELLED"],
  ] as const)
    assert.throws(() => assertTransition(from, to));
});
test("clinic queue boundaries use Vietnam time independent of server timezone", () => {
  const range = clinicDayRange("2030-01-01");
  assert.equal(range.gte.toISOString(), "2029-12-31T17:00:00.000Z");
  assert.equal(range.lt.toISOString(), "2030-01-01T17:00:00.000Z");
  assert.throws(() => clinicDayRange("2030-02-30"));
});
test("disabled/deleted accounts lose sessions and roles are refreshed from database", () => {
  const token = { id: "owner", role: "SYSTEM_ADMIN" };
  assert.equal(
    refreshAccountToken(token, { role: "OWNER", isActive: false }),
    null,
  );
  assert.equal(refreshAccountToken(token, null), null);
  assert.equal(
    refreshAccountToken(token, { role: "OWNER", isActive: true })?.role,
    "OWNER",
  );
});
