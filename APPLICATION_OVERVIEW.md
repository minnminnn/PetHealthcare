# PetCare — Current application overview

This file describes implemented behavior. Older passport specifications are design proposals, not proof that every feature is implemented.

## Routes and implementation

| Route (prefix with /vi or /en) | Implementation |
| --- | --- |
| `/login`, `/register` | Credentials authentication, account creation, optional Google OAuth. Clinic registrations request review and initially receive OWNER access. |
| `/dashboard/owner` | Owner data queried from PostgreSQL, links to pet, appointment and reminder workflows. |
| `/dashboard/pets` | List, create, archive pets. Initial weight and pet are saved atomically. |
| `/dashboard/pets/[petId]` | Protected passport, profile changes, weight history, clinical records, vaccinations, prescriptions and print. Clinical actions require an established patient relationship. |
| `/dashboard/appointments` | In-person/follow-up requests, clinic/vet selection, owner history and cancellation. Future dates, duration, ownership, species, clinic membership and overlapping pet/vet schedules are checked. Serializable transactions retry conflicting concurrent writes. |
| `/dashboard/clinic` | Clinic-scoped daily queue, status transitions, patient passport access, operating status and addition of vetted staff accounts. |
| `/dashboard/admin` | System-admin review of clinic registrations. Approval creates a clinic and grants CLINIC_ADMIN atomically. |
| `/dashboard/reminders` | Create, pause, resume and delete unsent reminders; view delivery state. In-app and optional email channels. |
| `/dashboard/notifications` | Current user's notifications and mark-read action. |
| `/dashboard/donors` | Donor application, withdrawal, clinician screening, clinic requests and owner responses. Matching is for coordination only, not a transfusion decision. |
| `/clinics`, `/emergency` | Database discovery, geolocation, map, emergency links and error handling. |
| `/tele-vet` | Database-backed clinician directory linking to in-person booking. Video and online checkout are explicitly unavailable. |
| `/pharmacy` | Database-backed medicine library. General toxic-food guidance remains curated page content. Empty database means an empty library. |
| `/blood-donor` | Educational information and entry point to donor coordination. |

## Security and reliability

- Auth.js JWT callbacks re-read account role/activity. Inactive or deleted users lose authenticated sessions.
- Protected dashboard layout verifies the session server-side. Middleware's cookie check is only a navigation optimization.
- Appointment changes require membership of the appointment's clinic. A pet visiting multiple clinics does not grant cross-clinic schedule editing.
- Terminal appointment states cannot be reopened/cancelled arbitrarily. Conditional updates detect concurrent state changes.
- Pet, reminder and notification writes enforce ownership. Medical attachment changes require the record's clinic, not merely access to its patient.
- Reminder persistence is independent of Inngest availability. The worker polls due records, checks current state, uses stable notification IDs and email idempotency keys, and atomically marks delivery/creates recurrence.
- No fake success response is returned for unimplemented push delivery.

## Data and setup

PostgreSQL with pg_trgm, unaccent and uuid-ossp. Clinic distance ranking uses portable Haversine calculations, not PostGIS. The versioned baseline migration supports an empty database; existing db-push installations must be baselined only after checking schema compatibility. See README.

The demo dataset is fictional and separated by IDs/labels. Medical demo entries are illustrative, not clinical recommendations. Existing `seed.ts` is legacy and should only be used in an isolated test database.

## Validation scope and limits

The automated suite checks pure services and selected API behavior with mocked persistence. It does not establish real email delivery, live OAuth success, PostgreSQL concurrency correctness or complete browser coverage. CI is configured to apply migrations against a disposable PostgreSQL service; a successful CI run must be observed separately.

Still outside the implemented scope: video/audio calls, payment checkout, Web Push/SMS, time-limited QR sharing, direct attachment upload, password recovery and a comprehensive account-settings screen. Existing passport print uses browser printing. Clinical data and medicine content require qualified review before real-world use.
