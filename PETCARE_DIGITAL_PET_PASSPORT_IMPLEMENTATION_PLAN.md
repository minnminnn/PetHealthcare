# PetCare Digital Pet Passport Implementation Plan

## 1. Objective

Build an authenticated, bilingual Digital Pet Passport at:

```text
/[locale]/dashboard/pets/[petId]
```

The page will give owners and authorised clinical users a reliable view of one pet's identity and longitudinal health record. It will support multiple pets, role-aware actions, responsive layouts, light and dark modes, print output, and safe QR sharing when a secure sharing mechanism exists.

This plan is based on the specification in `PETCARE_DIGITAL_PET_PASSPORT_SPEC.md` and the current repository implementation.

## 2. Recommended delivery strategy

Deliver the feature in vertical slices, with security and data contracts first.

The recommended order is:

1. Establish a clean baseline and close authorization gaps.
2. Define shared status and timeline helpers with tests.
3. Add a passport-focused query contract.
4. Create the protected route and loading/error boundaries.
5. Build the read-only owner passport.
6. Add clinical sections and role-aware mutations.
7. Add print and secure sharing.
8. Complete accessibility, localization, responsive behavior, and verification.

Do not begin with a large client-only page. The route should authenticate on the server, and interactive controls should live in focused client components.

## 3. Existing foundations to reuse

### Authentication and authorization

- NextAuth v5 session support in `server/auth.ts`
- Locale-aware authenticated redirect pattern in the owner dashboard
- Role values for owner, veterinarian, clinic administrator, and system administrator
- Public, protected, clinic-authorized, and system-admin tRPC procedures
- Auth middleware protecting `/dashboard`

### Pet and clinical data

- `Pet` identity and owner relationship
- Weight history
- Vaccinations
- Medical records
- Prescriptions
- Appointments
- Reminders
- Blood-donor profile
- Passport and microchip identifiers
- Owner and clinical tRPC routers

### Existing UI and utilities

- `components/pets/PetPassport.tsx`
- Locale-aware navigation from `lib/navigation.ts`
- Radix UI primitives already installed for tabs, dialogs, select controls, tooltips, and scroll areas
- Sonner toast notifications
- `qrcode.react`
- Inter variable font
- Existing neutral and coral visual language
- Existing print stylesheet entry point
- Existing responsive global shell and navigation

## 4. Repository findings that affect the implementation

### 4.1 Pet read authorization is currently too broad

`pets.byId` permits any authenticated veterinarian, clinic administrator, or system administrator to read any pet when the pet ID is known. It does not verify an appointment, clinic relationship, consent, or another explicit authorization link.

Before exposing a full medical passport, define and enforce the exact clinical access rule.

Recommended policy candidate:

- Owner: pet belongs to the current user.
- Veterinarian: the veterinarian is assigned to an appointment for the pet, or the pet has an active authorized encounter at the veterinarian's clinic.
- Clinic administrator: the pet has an authorized encounter at the administrator's clinic.
- System administrator: explicit administrative access according to existing policy.

The final rule requires a product/privacy decision. It must be represented by one reusable server-side authorization helper rather than repeated role checks.

### 4.2 Clinical mutations check role, not patient relationship

The following procedures confirm that a user has a clinical role but do not confirm that the user or clinic is authorized to modify the selected pet:

- `medical.createRecord`
- `medical.addVaccination`
- `medical.createPrescription`
- `medical.addAttachmentToRecord`

These procedures must call the same pet-access helper before their actions are exposed in the passport.

### 4.3 Reminder mutation ownership requires hardening

`reminders.toggle` and `reminders.delete` currently update by reminder ID without verifying that the reminder belongs to one of the current owner's pets. Add ownership validation before connecting reminder controls to the passport.

### 4.4 QR sharing is not secure or complete

The existing `PetPassport` component generates:

```text
/passport/[passportNumber]
```

That route does not exist. The current QR code uses a stable passport number, and there is no revocable or expiring share-token model.

Do not publish a medical route based only on `passportNumber`.

Choose one of these MVP paths:

1. Recommended for production: add revocable, expiring, read-only share tokens.
2. If secure sharing is deferred: provide the QR modal UI but disable QR generation with clear explanatory copy.

### 4.5 Document metadata is incomplete

Medical record attachments are currently stored as an array of URLs. The specification calls for file name, document type, upload date, associated record, and uploader.

For a complete Documents tab, introduce a first-class attachment model. If schema work is deferred, the MVP can list record attachments with only the information that exists and must not invent missing metadata.

### 4.6 Critical medical alerts are not structured

The current schema has general pet notes and medical-record text fields, but no structured allergies, chronic conditions, or handling alerts.

MVP behavior:

- Render `No critical medical alerts recorded`.
- Do not parse general notes to infer allergies or conditions.
- Track structured medical alerts as a later schema feature.

### 4.7 Prescription details have limits

Prescription drugs are stored in JSON with name, dosage, frequency, duration, and optional notes. The prescription has `issuedAt` and optional `validUntil`, but individual drug start and end dates are not structured.

Derive only statuses that the current record supports. Do not invent per-drug dates.

### 4.8 Upload infrastructure is not wired into an application route

UploadThing packages and environment variables exist, but the current route tree does not contain an UploadThing file router. The attachment upload flow needs a secure upload endpoint before the UI can support new clinical documents.

### 4.9 Existing passport component needs refactoring

`components/pets/PetPassport.tsx` is a Vietnamese-only printable card. It contains QR, share, and print actions inside the component and uses a hard-coded public URL. It should be split into reusable concerns:

- Interactive passport page header
- QR dialog
- Print-only document
- Shared identity formatting helpers

The existing visual and print behavior should be reused, not copied into a competing passport implementation.

### 4.10 Baseline code issues should be resolved first

Before feature work, run the current typecheck and tests and record existing failures. Fix only blockers relevant to this feature. The repository currently contains duplicated object properties and duplicated visible values in nearby code, so the baseline must be known before passport changes are evaluated.

## 5. Proposed architecture

### 5.1 Route structure

```text
app/[locale]/dashboard/pets/[petId]/
  page.tsx
  loading.tsx
  error.tsx
  not-found.tsx
```

Optional future route:

```text
app/[locale]/dashboard/pets/[petId]/passport/print
```

Do not add section sub-routes in the first implementation unless the single-page bundle or data volume becomes a demonstrated problem.

### 5.2 Server responsibilities

- Validate locale.
- Confirm the session before private data is requested.
- Redirect unauthenticated users to the localized login route.
- Validate `petId`.
- Apply safe not-found or forbidden behavior without revealing another user's pet.
- Determine the server-authoritative permission set.
- Add `noindex` metadata for private passport pages.
- Render the route shell and initial non-interactive structure.

### 5.3 Client responsibilities

- Pet switching
- Responsive accessible tabs
- Timeline sorting and filtering
- Dialogs and forms
- QR dialog state
- Print action
- Chart interaction
- tRPC query and mutation states
- Query invalidation after successful mutations

### 5.4 Component structure

```text
components/pets/passport/
  PetPassportPage.tsx
  PetPassportHeader.tsx
  PetSwitcher.tsx
  PetHealthSnapshot.tsx
  CriticalMedicalInfo.tsx
  PetPassportTabs.tsx
  PetOverview.tsx
  MedicalTimeline.tsx
  MedicalRecordsSection.tsx
  VaccinationsSection.tsx
  PrescriptionsSection.tsx
  AppointmentsSection.tsx
  MedicalDocumentsSection.tsx
  HealthTrackingSection.tsx
  UpcomingCare.tsx
  BloodDonorSummary.tsx
  PetPassportQrDialog.tsx
  PetPassportPrintView.tsx
  AddMedicalRecordDialog.tsx
  AddVaccinationDialog.tsx
  AddPrescriptionDialog.tsx
  passport-status.ts
  passport-timeline.ts
  passport-types.ts
```

This is a target structure, not a requirement to create every file immediately. Extract a component when it has its own data, behavior, accessibility contract, or test surface.

### 5.5 Data contract

The initial passport needs:

```text
pet identity
owner-safe identity data
permission set
owner pet list when the viewer is the owner
weight history
vaccinations
medical records with clinic and vet
prescriptions
appointments with clinic and vet
active reminders
blood-donor profile
attachment references
```

Recommended API direction:

- Add a focused `pets.passport` or `pets.getPassportOverview` query.
- Keep the response aligned with the Prisma schema and existing tRPC conventions.
- Return a server-derived permission object, for example:

```ts
{
  canEditProfile: boolean;
  canAddMedicalRecord: boolean;
  canAddVaccination: boolean;
  canAddPrescription: boolean;
  canAddAttachment: boolean;
  canPrint: boolean;
  canManageShare: boolean;
}
```

- Do not trust a role calculated only in the client.
- Avoid exposing owner phone or email unless the viewer and use case require it.

One aggregation query is justified for the initial snapshot if it prevents a visible waterfall. Detailed tabs may be split into separately cached queries later if medical histories become large.

## 6. Phased implementation plan

## Phase 0: Baseline and security gates

### Work

1. Run the existing tests, typecheck, and lint or document unavailable commands.
2. Record pre-existing failures separately from passport work.
3. Define the clinical pet-access policy with the product owner.
4. Add a reusable server helper such as `assertPetAccess`.
5. Apply the helper to `pets.byId` and all clinical mutations.
6. Add owner validation to reminder toggle and delete mutations.
7. Decide whether secure QR sharing is MVP or deferred.
8. Confirm medical attachment privacy requirements.

### Tests first

- Owner can access own pet.
- Owner cannot access another owner's pet.
- Authorized veterinarian can access the intended pet.
- Unrelated veterinarian cannot access the pet.
- Authorized clinic administrator follows the chosen clinic rule.
- Clinical mutations reject an unauthorized pet.
- Reminder mutations reject another owner's reminders.

### Exit criteria

No passport UI work begins until private read and mutation authorization rules have executable tests.

## Phase 1: Shared domain helpers

### Work

Create pure, tested helpers for:

- Pet age formatting
- Vaccination status
- Prescription status supported by current dates
- Appointment grouping
- Weight change
- Recent activity merging
- Timeline sort and filter
- Locale-aware date formatting
- Empty versus unknown status

### Important rules

- Missing data is `unknown`, not healthy.
- Vaccination `dueSoon` uses one documented threshold.
- Public pharmacy dosage is never mixed with prescribed dosage.
- Timeline events retain their source type and source ID.

### Exit criteria

All status and timeline helpers have deterministic unit tests for dates, missing values, and locale formatting.

## Phase 2: Passport query and permission contract

### Work

1. Add the passport query to the pets router or a dedicated passport router.
2. Reuse the access helper.
3. Include all required relations with bounded ordering.
4. Return veterinarian information for appointments where available.
5. Return owner pet-switcher data only when appropriate.
6. Return the server-derived permission set.
7. Avoid returning private owner contact information by default.

### Performance rules

- Order and limit recent activity at the database where practical.
- Do not load unbounded attachment or medical-history payloads.
- Use `petId` in every query key.
- Do not keep previous pet data as placeholder data when switching pets.

### Exit criteria

The query returns the complete MVP read model for an authorized viewer and safe errors for all unauthorized cases.

## Phase 3: Protected route and application states

### Work

1. Create `/[locale]/dashboard/pets/[petId]/page.tsx`.
2. Apply `setRequestLocale`.
3. Check the session before rendering private content.
4. Redirect unauthenticated users to localized login with a callback URL.
5. Add route metadata with `robots: noindex, nofollow`.
6. Add loading, error, and safe not-found boundaries.
7. Add the no-pet onboarding state.

### State coverage

- Loading pet header and snapshot
- Invalid pet ID
- Missing pet
- Forbidden pet access without existence leakage
- Expired session
- Owner with no pets
- Query failure with retry

### Exit criteria

The route is private, locale-aware, and safe before feature sections are added.

## Phase 4: Read-only passport shell

### Work

Build the first useful owner experience:

1. Pet switcher
2. Identity header
3. Passport and microchip information
4. Role-aware primary actions
5. Health snapshot
6. Critical medical information empty state
7. Accessible tabs
8. Overview identity block
9. Upcoming care
10. Recent activity
11. Blood-donor summary

### Responsive behavior

- Mobile: one-column identity, actions, snapshot, and tab content.
- Tablet: two-column snapshot and content groups.
- Desktop: wide identity header, snapshot row, main content with a supporting side column.
- Tabs become horizontally scrollable or a labeled select on narrow screens.
- Urgent information remains above tabs.

### Accessibility

- Keyboard-operable switcher and tabs
- Correct tab roles and relationships
- Visible focus states
- Text labels alongside status colors
- Alt text for the pet image
- Logical heading order
- Reduced-motion support

### Exit criteria

An owner with one or multiple pets can navigate and understand current health information without any clinical mutation controls.

## Phase 5: Detailed read sections

Implement one section at a time, including loading, empty, error, and populated states.

### Medical timeline

- Merge medical records, vaccinations, prescriptions, appointments, weights, and supported documents.
- Default to newest first.
- Add basic event-type filters.
- Defer date-range and text search until data volume proves they are necessary.

### Medical records

- Render only existing schema fields: type, title, description, diagnosis, treatment, visit date, clinic, vet, privacy flag, and attachments.
- Do not invent symptoms, observations, or follow-up dates.

### Vaccinations

- Show administered date, next due date, manufacturer, batch number, veterinarian, clinic, notes, and certificate where available.
- Use the shared vaccination-status helper.

### Prescriptions

- Validate and parse the JSON drug payload with Zod before display.
- Show issued date, valid-until date, prescriber, clinic, instructions, refills, and each supported drug field.

### Appointments

- Group into upcoming, past, and cancelled.
- Show clinic, veterinarian, consultation type, status, time, and chief complaint.
- Show booking only when a real booking route or flow exists.

### Documents

- MVP: list the attachment URLs tied to medical records and vaccination certificate URLs with honest limited metadata.
- Full version: migrate to a first-class medical attachment model.

### Health tracking

- Show current and previous weight, neutral change wording, and measurement dates.
- Prefer a small semantic SVG chart or an existing lightweight dependency.
- Run `$pick-ui-library` before adding a chart dependency.

### Exit criteria

Every detail tab uses real backend data and has a role-appropriate empty state.

## Phase 6: Clinical mutation flows

Implement only after Phase 0 authorization tests pass.

### Add medical record

- Use the actual `medical.createRecord` input.
- Confirm the selected pet in the dialog.
- Support type, title, description, diagnosis, treatment, visit date, privacy flag, and validated attachment URLs.

### Record vaccination

- Use `medical.addVaccination`.
- Support vaccine name, manufacturer, batch number, administered date, next due date, and notes.
- Do not display clinic name or certificate fields as editable until the API supports them.

### Add prescription

- Use `medical.createPrescription`.
- Validate each drug row.
- Support name, dosage, frequency, duration, notes, instructions, valid-until date, and refills.

### Mutation behavior

- Disable duplicate submission.
- Avoid optimistic clinical writes.
- Show explicit validation and server errors.
- Invalidate only the affected passport queries.
- Show a success toast after confirmed persistence.
- Keep the selected pet ID visible in the form.

### Exit criteria

Authorized clinical users can create supported records, and owners cannot access the same mutations through UI or direct API calls.

## Phase 7: Attachments, QR, and print

### Attachment upload

1. Add a secure UploadThing file router or the project's chosen upload route.
2. Restrict file type and size.
3. Authorize the clinical user before issuing upload access.
4. Associate the uploaded asset with a medical record.
5. Prefer signed access for private files.
6. Add retry and failure states.

### Secure QR sharing

If QR sharing is included in MVP, add a model such as:

```text
PassportShareToken
id
petId
tokenHash
scope
expiresAt
revokedAt
createdByUserId
createdAt
lastAccessedAt
```

Then implement:

- Owner-created share token
- Expiry selection
- Revocation
- Read-only scoped shared summary
- Non-guessable token
- No indexing
- Audit timestamp
- QR code pointing to the tokenized route

Do not place raw medical information in the QR payload.

### Print view

- Refactor the existing `PetPassport` into a dedicated print view.
- Print identity, identifiers, blood type, critical information, vaccinations, active prescriptions, and selected recent history.
- Hide navigation, dialogs, editing controls, and interactive tabs.
- Use localized labels and dates.
- Verify browser print preview in both locales.

### Exit criteria

Print output is concise and correct. QR sharing is either secure and complete or clearly deferred without a misleading active button.

## Phase 8: Internationalization and interface hardening

### Work

1. Add a `PetPassport` namespace to `messages/en.json` and `messages/vi.json`.
2. Move every new visible string into translations.
3. Localize dates, number formatting, weight units, and status labels.
4. Verify long Vietnamese labels at all breakpoints.
5. Verify light and dark modes.
6. Verify keyboard navigation and screen-reader names.
7. Check that dialogs restore focus.
8. Check that status is never communicated by color alone.
9. Add reduced-motion behavior for any transition.

### Exit criteria

The same feature is complete and understandable in Vietnamese and English on mobile, tablet, and desktop.

## Phase 9: Testing and release verification

### Unit tests

- Pet access policy
- Vaccination status dates
- Prescription status
- Age formatting
- Weight change
- Appointment grouping
- Timeline merging and ordering
- Prescription JSON validation
- Permission mapping

### Router integration tests

- Owner reads own pet
- Cross-owner access is rejected safely
- Authorized clinical access
- Unrelated clinical access rejection
- Medical record creation
- Vaccination creation
- Prescription creation
- Attachment authorization
- Reminder ownership
- Share-token expiry and revocation if implemented

### Component tests

- Pet switcher keyboard behavior
- Accessible tabs
- Empty states by role
- Clinical action visibility
- Form validation
- Mutation loading and errors
- No stale pet content during a switch

### End-to-end scenarios

- Owner with no pets
- Owner with one pet and no medical history
- Owner with multiple pets
- Pet with extensive history
- Veterinarian with valid access
- Veterinarian without access
- Invalid pet ID
- Expired session
- Failed clinical mutation
- Mobile and desktop
- Light and dark mode
- English and Vietnamese
- Print preview
- QR token expiry and revocation if implemented

### Final commands

At minimum:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

If no general `test` script exists when implementation starts, add explicit test scripts rather than relying on ad hoc commands.

## 7. Suggested file changes

### Add

```text
app/[locale]/dashboard/pets/[petId]/page.tsx
app/[locale]/dashboard/pets/[petId]/loading.tsx
app/[locale]/dashboard/pets/[petId]/error.tsx
app/[locale]/dashboard/pets/[petId]/not-found.tsx
components/pets/passport/*
lib/pets/pet-access.ts
lib/pets/passport-status.ts
lib/pets/passport-timeline.ts
tests/passport/*
```

### Modify

```text
server/api/routers/pets.ts
server/api/routers/medical.ts
server/api/routers/appointments.ts
server/api/routers/reminders.ts
server/api/root.ts, only if a new router is introduced
components/pets/PetPassport.tsx
messages/en.json
messages/vi.json
styles/globals.css
app/[locale]/dashboard/owner/page.tsx
```

### Optional schema work

```text
prisma/schema.prisma
```

Possible additions:

- Secure passport share tokens
- Structured medical alerts
- First-class medical attachments
- Clinical record revisions or audit events

Do not combine all optional schema additions into the first migration unless their corresponding MVP features are approved.

## 8. Skills to use during implementation

Use the following skills in this order when their phase begins.

| Skill | When to use | Contribution |
| --- | --- | --- |
| `$senior-fullstack` | Phases 0-3 and API/mutation work | Reviews Next.js, tRPC, Prisma, authentication, server/client boundaries, security, and data contracts |
| `$test-driven-development` | Before each authorization rule, status helper, query, and mutation | Establishes failing tests first and prevents security or date-logic regressions |
| `$interface-design` | Phases 4-8 | Designs the passport as an authenticated product interface rather than a marketing page, including hierarchy, responsive behavior, and dense clinical information |
| `$pick-ui-library` | Before adding a chart or any missing complex primitive | Checks whether a dependency is justified and selects the smallest appropriate option |
| `$systematic-debugging` | Whenever a test, query, permission rule, hydration path, or responsive state fails | Forces root-cause analysis before changing code |
| `$verification-before-completion` | At the end of every phase and before final delivery | Requires fresh evidence from tests, typecheck, lint, build, and relevant manual scenarios |

### Skills not recommended as the primary implementation skill

- `$design-taste-frontend` is optimized for landing pages, portfolios, and visual redesigns. It may help with the public-facing print card, but `$interface-design` is the better primary fit for a private medical dashboard.
- `$gpt-taste` emphasizes cinematic marketing layouts and advanced GSAP. That approach is not appropriate for a safety-sensitive medical record interface where clarity, stability, accessibility, and data density are more important.
- `$shadcn` is not necessary unless the team explicitly wants to introduce shadcn-managed components. The project already has Radix primitives and custom styling.

## 9. Recommended skill workflow per phase

### Backend and security phase

```text
$senior-fullstack
$test-driven-development
$systematic-debugging, only when a failure appears
$verification-before-completion
```

### Interface phase

```text
$interface-design
$test-driven-development
$pick-ui-library, only if a chart dependency is needed
$verification-before-completion
```

### Clinical form phase

```text
$senior-fullstack
$interface-design
$test-driven-development
$systematic-debugging, only when a failure appears
$verification-before-completion
```

## 10. MVP scope

The first production-ready release should contain:

- Protected localized route
- Safe owner and authorized-clinical access
- Multiple-pet switcher for owners
- Identity header
- Passport and microchip details
- Health snapshot
- Critical-alert empty state
- Overview and recent activity
- Unified timeline
- Medical records
- Vaccinations
- Prescriptions
- Appointments
- Weight history
- Upcoming reminders
- Blood-donor summary
- Honest document handling based on available metadata
- Authorized medical-record, vaccination, and prescription creation
- Vietnamese and English translations
- Loading, empty, error, and no-pet states
- Mobile, tablet, and desktop layouts
- Light and dark modes
- Accessible tabs and dialogs
- Print view
- Secure QR sharing only if the token model is approved and implemented

## 11. Explicit non-goals for the first release

- AI diagnosis or treatment recommendations
- Automatic healthy/unhealthy weight judgments
- Inferred allergies or chronic conditions
- Medical-record revision history unless separately approved
- Imaging viewer
- Cross-clinic record imports
- Health analytics beyond neutral recorded trends
- Owner editing of veterinarian-authored records
- Fake booking, upload, QR, or sharing actions
- Public medical access through a passport number alone

## 12. Product decisions required before implementation

1. What exact relationship authorizes a veterinarian or clinic administrator to open a pet passport?
2. Is secure QR sharing required for MVP, or should the action remain unavailable until Phase 2?
3. Should Documents MVP use limited existing URL data, or should a first-class attachment migration be included now?
4. Which pet fields may owners edit, especially microchip and blood type?
5. Is appointment booking in scope, given that no dedicated booking page currently exists?
6. Should the first release include clinical attachment upload, or only display existing attachments?

## 13. Definition of done

The feature is done only when:

- Private data is never fetched before authentication.
- Owner, veterinarian, clinic, and admin access rules are enforced on the server.
- URL manipulation cannot reveal another owner's pet.
- Clinical mutations validate the pet relationship, not only the user role.
- Pet switching never shows stale information from another pet.
- All passport sections use real backend data.
- Missing data is represented honestly.
- Owners cannot see or execute protected clinical actions.
- Authorized clinical users can complete supported mutations and receive confirmed feedback.
- The interface works in Vietnamese and English.
- The interface works on mobile, tablet, and desktop.
- Light mode, dark mode, keyboard navigation, focus management, and reduced motion are verified.
- Print output contains only intended medical passport information.
- QR sharing is either secure or not presented as active.
- Unit, integration, component, and end-to-end verification passes with fresh evidence.
