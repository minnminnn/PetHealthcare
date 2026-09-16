# PetCare — Digital Pet Passport Page Specification

## 1. Purpose

Build an authenticated **Digital Pet Passport** experience for PetCare.

The page should work as a pet-specific digital identity and longitudinal health record that can be used by:

- **Pet owners** to view their pet's identity, medical status, vaccination history, prescriptions, appointments, weight history, reminders, and documents.
- **Veterinarians / authorised clinical staff** to review the pet's health history and add or update clinical information where the existing role-based backend permits it.
- **Clinic administrators / system administrators** according to existing backend role permissions.

The feature must support users who own **multiple pets**.

This is not just a profile page. It should behave like a digital medical passport that gives a quick health overview first, then lets authorised users drill into detailed records.

---

# 2. Existing PetCare foundations to reuse

The current application already has backend/domain support for:

- Authenticated owner dashboard
- Users and role-based access
- Multiple pets per owner
- Pet identity data
- Species
- Breed
- Colour
- Birth date
- Gender
- Neuter status
- Microchip number
- Passport number
- Profile image
- Blood type
- Current weight
- Weight history
- Vaccinations
- Vaccination due dates
- Medical records
- Medical record attachments
- Prescriptions
- Appointments
- Care reminders
- Blood-donor profile
- QR-code passport sharing
- Printable/downloadable passport behaviour
- Authenticated pet API operations
- Medical-record creation
- Vaccination creation
- Prescription creation
- Medical attachment upload
- Veterinary / clinic / admin role checks

The coding agent should reuse these existing models, APIs, auth rules, components, utilities, i18n patterns, and styling before introducing new abstractions.

Do **not** duplicate existing data models unless required.

---

# 3. Suggested routes

Primary passport route:

```text
/[locale]/dashboard/pets/[petId]
```

Optional explicit passport alias:

```text
/[locale]/dashboard/pets/[petId]/passport
```

Recommended approach:

Use:

```text
/[locale]/dashboard/pets/[petId]
```

as the main pet health page and visually brand it as the **Digital Pet Passport**.

Future sub-routes can be introduced only if the page becomes too large:

```text
/[locale]/dashboard/pets/[petId]/medical-records
/[locale]/dashboard/pets/[petId]/vaccinations
/[locale]/dashboard/pets/[petId]/prescriptions
/[locale]/dashboard/pets/[petId]/appointments
/[locale]/dashboard/pets/[petId]/documents
```

For the first implementation, prefer one well-structured page with tabs/sections.

---

# 4. Authentication requirements

This page must be inaccessible to unauthenticated users.

If no valid session exists:

```text
redirect -> /[locale]/login
```

The page must never load private pet medical data before authentication has been confirmed.

The coding agent should reuse the existing NextAuth v5/session protection pattern already used for protected routes.

---

# 5. Access-control rules

## 5.1 Pet owner

A pet owner can:

- View pets that belong to their account
- Switch between their own pets
- View pet identity information
- View health summary
- View vaccinations
- View medical history
- View prescriptions
- View appointments
- View weight history
- View reminders
- View medical documents/attachments they have permission to access
- View blood-donor information
- Print/download passport where supported
- Show QR passport where supported
- Update non-clinical pet profile information where the current `pets` API already permits it

An owner should **not** be allowed to alter veterinarian-authored clinical records unless the existing backend explicitly permits it.

Examples of owner-editable fields may include:

- Profile photo
- Colour
- General identity/profile information
- Possibly microchip/passport information if permitted by current API design

Do not expose owner edit controls for protected clinical fields simply because the UI can render them.

---

## 5.2 Veterinarian

An authenticated veterinarian should be able to:

- Search/select an authorised pet through an appointment or clinic workflow
- Open the pet's digital passport
- Read the pet's relevant health history
- Review vaccination status
- Review active/recent prescriptions
- Review previous medical records
- Review weight history
- View clinical attachments
- Add a medical record
- Add a vaccination
- Create a prescription
- Add attachments to a medical record

Only expose actions supported by existing authorised API procedures.

The veterinarian UI must make it visually obvious which information is:

- Historical
- Current
- Owner-provided
- Veterinarian/clinic recorded

---

## 5.3 Clinic administrator

Clinic administrators should receive only the actions permitted by existing clinic-authorised backend procedures.

Do not infer extra permissions in the frontend.

---

## 5.4 System administrator

System administrators follow existing system-admin backend permissions.

---

# 6. Multi-pet owner experience

A user may have multiple pets.

The passport page must include a **pet switcher** near the top of the page.

Recommended design:

```text
------------------------------------------------
Digital Pet Passport
[ Luna ▼ ]                     [ QR ] [ Print ]
------------------------------------------------
```

The pet switcher can use:

- Avatar/photo
- Pet name
- Species
- Breed
- Optional short medical-status indicator

Example:

```text
Luna
Dog · Golden Retriever
Vaccinations up to date
```

When a pet is changed:

- Navigate to the new `petId`
- Fetch the selected pet's data
- Avoid mixing previous pet data during loading
- Update breadcrumbs/title
- Preserve locale

Do not place every pet passport on one large page.

---

# 7. Recommended information architecture

Use a two-level experience:

## Level 1 — Health Snapshot

The user should understand the pet's current condition in a few seconds.

Show:

- Pet identity
- Critical health alerts
- Vaccination status
- Active medication status
- Next appointment
- Upcoming care items
- Last clinical visit

## Level 2 — Detailed medical information

Use tabs or clearly separated sections.

Recommended tabs:

```text
Overview
Medical History
Vaccinations
Prescriptions
Appointments
Documents
Health Tracking
```

On smaller screens, use:

- Horizontally scrollable tabs
- Segmented controls
- Or an accessible select/dropdown

Do not hide urgent health information behind a tab.

---

# 8. Page header

The top header should visually resemble a digital identity/passport document without becoming decorative at the expense of usability.

## Include

### Pet photo

Large circular or rounded profile image.

Fallback:

- Species icon
- Initial/avatar placeholder

### Pet name

Example:

```text
Luna
```

### Species + breed

Example:

```text
Dog · Golden Retriever
```

### Passport number

If available:

```text
Pet Passport No.
PC-VN-0001249
```

### Microchip number

If available.

### QR code action

Button:

```text
Show QR Passport
```

### Print/download action

If the existing component already supports this:

```text
Print / Download
```

### Edit pet profile

Visible only when allowed.

---

# 9. Health Status Summary

Immediately below the identity header, add a medical summary area.

Recommended status cards:

```text
Vaccinations
Medication
Last Check-up
Next Appointment
Current Weight
Blood Type
```

Example:

```text
Vaccinations
Up to date
Next due: 14 Nov 2026
```

```text
Current Medication
2 active prescriptions
```

```text
Last Vet Visit
02 Sep 2026
```

```text
Current Weight
18.4 kg
```

Do not invent medical interpretations.

The UI may describe record status, for example:

- Up to date
- Due soon
- Overdue
- Active
- Completed

But only calculate these from existing date/status data.

---

# 10. Critical medical banner

Important clinical information should appear above ordinary history.

Possible content:

- Known allergies
- Important chronic conditions
- Current medication warnings
- Special handling notes
- Recent significant diagnosis

Only include these if the current schema contains appropriate structured data.

If these fields do not exist yet, create the UI section as an optional placeholder and document the required schema change separately.

Do not overload generic medical-record notes and automatically classify them as allergies or chronic conditions.

Example visual structure:

```text
Important Medical Information
Allergy: ...
Condition: ...
Current medication: ...
```

If there is no data:

```text
No critical medical alerts recorded
```

---

# 11. Overview tab

The Overview tab should give owners and vets a complete summary without requiring them to open every section.

Recommended blocks:

## A. Identity

- Name
- Species
- Breed
- Colour
- Date of birth
- Age derived from DOB
- Sex/gender
- Neuter status
- Microchip
- Passport number

## B. Clinical snapshot

- Blood type
- Current weight
- Last weight update
- Last medical visit
- Active prescriptions count
- Vaccination status
- Next vaccine due date

## C. Upcoming care

- Next appointment
- Upcoming vaccination
- Active reminder
- Deworming/flea reminder if available

## D. Recent medical activity

Show latest 3–5 events from:

- Medical records
- Vaccinations
- Prescriptions
- Appointments
- Weight records

Each item should clearly identify its source/type.

Example:

```text
02 Sep 2026
General examination
Melbourne Veterinary Clinic
Recorded by Dr. ...
```

---

# 12. Unified Medical Timeline

A timeline is strongly recommended because it makes the passport useful to veterinarians.

Create a chronological view that merges health events.

Possible timeline event types:

- Medical visit
- Diagnosis/clinical record
- Vaccination
- Prescription
- Appointment
- Weight record
- Uploaded medical document

Example:

```text
02 Sep 2026
Medical Record
Routine examination

18 Aug 2026
Vaccination
Rabies booster

03 Aug 2026
Weight
18.4 kg
```

## Timeline controls

Allow:

- Newest first / oldest first
- Filter by event type
- Date range if easy to support
- Search only if backend data volume warrants it

Do not implement advanced filters before the basic timeline works reliably.

---

# 13. Medical Records tab

This section should display veterinarian-authored records.

Each medical record card should contain, when available:

- Record date
- Vet/clinic
- Visit reason
- Symptoms
- Clinical observations
- Diagnosis
- Treatment
- Notes
- Follow-up date
- Attachments

Use the exact available schema fields rather than inventing fields.

If the current database uses a generic text/notes structure, render those fields accordingly.

## Veterinarian actions

For authorised roles:

```text
+ Add Medical Record
```

Recommended creation flow:

1. Confirm current pet
2. Show encounter date
3. Enter supported clinical fields
4. Optional attachment
5. Save
6. Refresh passport
7. Show success toast

Add proper validation.

Do not make clinical changes optimistic if losing a failed request would be dangerous or confusing.

---

# 14. Vaccinations tab

This is one of the most important passport areas.

For each vaccination show:

- Vaccine name
- Date administered
- Next due date
- Status
- Clinic/veterinarian if available
- Certificate if available

Recommended statuses:

```text
Up to date
Due soon
Overdue
No due date
```

Suggested date logic:

- `overdue` if next due date < today
- `due soon` if within configurable future threshold
- `up to date` otherwise

Use one helper for this logic so it is consistent across passport/dashboard/reminders.

## Veterinarian action

```text
+ Record Vaccination
```

Use existing medical/vaccination API.

---

# 15. Prescriptions tab

Display:

- Medicine
- Dosage
- Frequency
- Start date
- End date
- Prescribing veterinarian
- Instructions
- Status

Status can be derived from dates where appropriate:

```text
Active
Completed
Future
```

Do not present dosage information from the public pharmacy page as a replacement for the pet's actual prescribed dosage.

The pet prescription record must remain the source of truth.

## Veterinarian action

```text
+ Add Prescription
```

Only available to roles allowed by the backend.

---

# 16. Appointments tab

Display:

- Date/time
- Clinic
- Veterinarian
- Consultation type
- Status
- Appointment reason if available

Possible consultation types already supported:

- In-person
- Video
- Audio
- Chat

Recommended grouping:

```text
Upcoming
Past
Cancelled
```

Owner action may include:

```text
Book Appointment
```

only if the existing booking flow supports it.

Do not create fake booking behaviour.

---

# 17. Documents tab

Medical documents make the passport useful when owners change clinics.

Possible attachments:

- Vaccination certificate
- Laboratory result
- Imaging report
- Discharge note
- Referral letter
- Prescription attachment
- Other medical document

Each item should show:

- File name
- Record type
- Upload date
- Associated medical record
- Uploaded by, if available
- Preview/download action

Use the existing attachment system.

Do not expose private file URLs directly if the storage provider requires signed access.

---

# 18. Health Tracking tab

## Weight

The existing app already supports weight history.

Display:

- Current weight
- Previous weight
- Weight change
- Weight history chart
- Measurement dates

Recommended chart:

```text
Weight (kg)
|
|          *
|      *       *
|   *
+-------------------- Date
```

Do not label weight change as healthy/unhealthy unless actual veterinary thresholds exist.

Prefer neutral wording:

```text
+0.6 kg since previous measurement
```

not:

```text
Unhealthy weight gain
```

unless supported by real clinical rules.

## Future possible metrics

Do not build unless data models exist:

- Temperature
- Heart rate
- Body condition score
- Glucose
- Activity
- Nutrition

Keep the first implementation focused on existing data.

---

# 19. Care Reminders

The existing reminder system supports:

- Vaccinations
- Medicine
- Appointments
- Grooming
- Weight checks
- Deworming
- Flea treatment
- Custom reminders

The passport overview should show a compact `Upcoming Care` block.

Example:

```text
Upcoming Care

18 Sep
Give heartworm medicine

22 Sep
Weight check

14 Nov
Rabies vaccination
```

Link to the full reminder area if/when that route exists.

---

# 20. Blood Information

Because the platform already has blood donor functionality, the passport may include:

```text
Blood Type
DEA 1.1 Positive
```

and:

```text
Blood Donor Status
Registered / Not Registered
```

If the pet has an existing donor profile:

- Show eligibility status
- Show donor registration status

Do not place emergency donor request management inside the passport itself.

Link to the blood donor section.

---

# 21. QR Passport

The existing application direction includes QR-code passport sharing.

Recommended behaviour:

```text
[ Show QR Passport ]
```

When opened, display:

- Pet name
- Photo
- Passport number
- QR code
- Short explanation

Example:

```text
Scan this QR code to open the shared pet health passport.
```

## Privacy requirement

Do not automatically expose the entire authenticated record through a publicly guessable URL.

The implementation should use the existing secure sharing design if one exists.

If secure sharing is not yet implemented, create the QR UI separately but do not create an insecure public medical endpoint.

Possible future sharing model:

- Time-limited token
- Revocable share token
- Read-only clinical summary
- Owner-controlled sharing

Treat this as a future backend task unless already supported.

---

# 22. Print / Download Passport

If existing `PetPassport` functionality already handles printable/downloadable behaviour, reuse it.

The printable version should be more concise than the interactive dashboard.

Suggested printable sections:

1. Pet identity
2. Owner details only if intentionally included
3. Microchip/passport number
4. Blood type
5. Critical medical information
6. Vaccination history
7. Active prescriptions
8. Recent major medical history
9. QR/reference identifier

Do not include navigation, buttons, menus, editable controls, or unnecessary dashboard UI.

---

# 23. Owner versus Vet UI

The same data page can serve multiple roles, but actions should adapt.

## Owner view

Primary actions:

```text
Switch Pet
Edit Profile
Show QR
Print Passport
Book Appointment
View Reminders
```

## Vet view

Primary actions:

```text
Add Medical Record
Record Vaccination
Add Prescription
Upload Attachment
```

Do not simply hide buttons client-side and consider that secure.

Backend procedures must enforce authorization.

---

# 24. Suggested desktop layout

```text
┌─────────────────────────────────────────────────────────────┐
│ Digital Pet Passport               QR    Print    Edit       │
│ [Pet switcher ▼]                                           │
├─────────────────────────────────────────────────────────────┤
│ [PHOTO]  Luna                                             │
│          Golden Retriever · Dog                            │
│          Passport: PC-VN-0001249                           │
│          Microchip: 985141000123456                        │
├─────────────────────────────────────────────────────────────┤
│ Vaccines     Weight      Blood       Medication    Next Vet │
│ Up to date   18.4 kg     DEA 1.1+    2 active      22 Sep   │
├─────────────────────────────────────────────────────────────┤
│ IMPORTANT MEDICAL INFORMATION                              │
│ No critical medical alerts recorded                        │
├─────────────────────────────────────────────────────────────┤
│ Overview | Medical | Vaccines | Prescriptions | ...        │
├─────────────────────────────────────────────────────────────┤
│ Main content                              │ Upcoming Care   │
│                                           │ Recent Activity │
│                                           │ Quick Actions   │
└─────────────────────────────────────────────────────────────┘
```

---

# 25. Suggested mobile layout

Order:

```text
Header
Pet switcher
Pet identity
Primary actions
Critical medical banner
Health snapshot cards
Tabs
Selected section
Upcoming care
```

Use one-column cards.

Avoid dense medical tables on mobile.

Convert tables to cards/rows where possible.

---

# 26. Empty states

Every medical section needs a deliberate empty state.

Examples:

## No medical records

```text
No medical records have been added yet.
```

Vet role:

```text
No medical records yet.
[ Add first medical record ]
```

Owner role:

```text
No medical records have been added by a veterinarian yet.
```

## No vaccinations

```text
No vaccination records available.
```

## No prescriptions

```text
No prescriptions recorded.
```

## No upcoming appointments

```text
No upcoming appointments.
```

## No weight history

```text
No weight measurements recorded yet.
```

Avoid treating missing data as healthy status.

---

# 27. Loading states

Do not show stale data from a previously selected pet.

Recommended behaviour:

- Skeleton for pet header
- Skeleton health-summary cards
- Skeleton list items
- Disable actions until required data is loaded
- Keep pet switcher usable only where it does not create race conditions

Use request keys that include `petId`.

---

# 28. Error states

Required cases:

- Pet not found
- Pet does not belong to owner
- User has no pets
- Medical-record request failed
- Vaccination request failed
- Prescription request failed
- Attachment failed
- Session expired
- Unsupported/invalid pet ID

Never leak whether another user's private pet exists.

For unauthorised access, use the same safe not-found/forbidden handling defined by the project.

---

# 29. No-pet onboarding

If an authenticated owner has no pets:

```text
Your Digital Pet Passport starts with a pet profile.

[ Add Your First Pet ]
```

This page should not break because the pet list is empty.

---

# 30. Suggested components

Reuse existing components first.

Potential structure:

```text
components/pets/passport/
  PetPassportHeader.tsx
  PetSwitcher.tsx
  PetHealthSummary.tsx
  CriticalMedicalInfo.tsx
  PetPassportTabs.tsx
  PetOverviewTab.tsx
  MedicalTimeline.tsx
  MedicalRecordsSection.tsx
  VaccinationsSection.tsx
  PrescriptionsSection.tsx
  AppointmentsSection.tsx
  MedicalDocumentsSection.tsx
  PetHealthTracking.tsx
  UpcomingCareCard.tsx
  PetPassportQRCode.tsx
  AddMedicalRecordDialog.tsx
  AddVaccinationDialog.tsx
  AddPrescriptionDialog.tsx
```

If an existing `PetPassport` component already overlaps this structure, extend/refactor it instead of creating a second competing implementation.

---

# 31. Suggested server/client split

Follow the existing Next.js App Router architecture.

Prefer:

## Server responsibilities

- Authentication check
- Route-level authorization
- Locale handling
- Initial pet lookup where consistent with current architecture

## Client responsibilities

- Pet switching
- Tabs
- Dialogs/forms
- Filters
- Charts
- Interactive QR display
- Mutation state

Do not turn the entire passport into a client component unless required.

---

# 32. Existing API areas to investigate first

Before coding, inspect:

```text
server/api/routers/pets*
server/api/routers/medical*
server/api/routers/appointments*
server/api/routers/reminders*
server/api/routers/bloodDonor*
```

The coding agent must determine the actual exported procedure names and input schemas.

Do not assume names such as:

```text
medical.addVaccination
```

unless they actually exist.

Use the real repository API names.

---

# 33. Data fetching strategy

Recommended page data:

```ts
pet
petList
medicalRecords
vaccinations
prescriptions
appointments
weightHistory
reminders
bloodDonorProfile
```

Avoid one huge duplicated response if existing APIs already expose these efficiently.

However, if initial rendering creates excessive network waterfalls, consider a dedicated passport aggregation query only after checking the current tRPC conventions.

Example conceptual API only:

```ts
pets.getPassportOverview({ petId })
```

This is an architectural option, not a required exact procedure name.

---

# 34. Forms and mutation safety

Clinical mutations should:

- Validate with Zod
- Require an authenticated authorised user
- Require valid `petId`
- Reject unauthorised pet/clinic access
- Return explicit errors
- Show loading states
- Prevent duplicate submissions
- Refresh/invalidate relevant queries after success
- Show a success/error toast

Never rely solely on frontend role detection.

---

# 35. Clinical audit information

Where supported by the existing schema, preserve/display:

- Created date
- Updated date
- Authoring veterinarian
- Clinic
- Associated appointment
- Attached files

Do not silently overwrite existing medical history.

If the current API uses updates, ensure edits can be distinguished from newly created records where possible.

For future schema work, consider immutable or auditable clinical record revisions.

---

# 36. Medical safety UX

PetCare already positions medical information as reference and not a substitute for a qualified veterinarian.

The passport should therefore avoid diagnostic claims generated by the UI.

Do not add:

- AI-generated diagnoses
- automatic treatment recommendations
- automatic medication changes
- unsupported normal/abnormal labels

It is acceptable to display:

```text
Vaccination overdue
Prescription active
Next appointment 22 Sep 2026
```

because those are record/date statuses.

---

# 37. Internationalisation

The entire feature must support:

```text
/vi
/en
```

All new visible strings should use the existing `next-intl` translation pattern.

Suggested translation namespace:

```text
PetPassport
```

Example keys:

```json
{
  "PetPassport": {
    "title": "Digital Pet Passport",
    "overview": "Overview",
    "medicalHistory": "Medical History",
    "vaccinations": "Vaccinations",
    "prescriptions": "Prescriptions",
    "appointments": "Appointments",
    "documents": "Documents",
    "healthTracking": "Health Tracking"
  }
}
```

Do not hard-code English or Vietnamese in the component if the existing codebase expects message files.

---

# 38. Accessibility

Required:

- Keyboard-accessible pet switcher
- Accessible tabs
- Semantic headings
- Form labels
- Dialog focus management
- Descriptive button labels
- Alt text for pet image
- Icons cannot be the only status indicator
- Good contrast in light/dark mode
- Reduced-motion compatibility

Example:

Do not use only a red icon for overdue.

Use:

```text
Overdue
```

plus the visual treatment.

---

# 39. Responsive design

Support at least:

- Mobile
- Tablet
- Desktop

The app already has responsive navigation and light/dark themes. The passport must fit those patterns.

Do not design only for desktop.

---

# 40. Privacy considerations

Pet medical information is private account data.

Requirements:

- Authenticate before fetching private medical information
- Authorise every mutation server-side
- Prevent cross-owner pet access
- Avoid exposing internal database IDs unnecessarily in public sharing
- Protect medical attachments
- Avoid public indexing
- Do not store unnecessary clinical data in browser persistence
- Avoid logging sensitive medical content in production console logs

---

# 41. Suggested status hierarchy

Use a small consistent status system.

## Clinical/date statuses

```text
upToDate
dueSoon
overdue
active
completed
cancelled
scheduled
unknown
```

Map these to design tokens rather than hard-coded component colours.

Status meaning should always be communicated with text.

---

# 42. Recommended MVP

The first production-quality version should include:

1. Authenticated route
2. Multiple-pet switcher
3. Pet identity header
4. Passport + microchip information
5. Health summary cards
6. Vaccination status
7. Medical-record history
8. Prescriptions
9. Appointments
10. Weight history
11. Upcoming reminders
12. Documents/attachments
13. Owner vs vet action permissions
14. Vet add-medical-record flow
15. Vet add-vaccination flow
16. Vet add-prescription flow
17. QR UI using existing secure capability
18. Print/download using existing functionality
19. Vietnamese + English translations
20. Loading, empty, and error states
21. Mobile/desktop responsiveness
22. Light/dark mode support

---

# 43. Features to leave for later unless already supported

Do not expand scope unnecessarily.

Possible Phase 2 items:

- Secure time-limited QR sharing
- Share passport with a selected clinic
- Explicit allergies/chronic-condition structured schema
- Laboratory result categories
- Imaging viewer
- Veterinarian signatures
- Verified medical-record badges
- Record revision history
- Emergency medical card
- Cross-clinic record import
- Health analytics
- Push alerts from passport status
- PDF export with selectable sections
- Owner-uploaded historical records requiring vet verification

---

# 44. Proposed page behaviour by role

| Feature | Owner | Veterinarian | Clinic Admin | System Admin |
|---|---:|---:|---:|---:|
| View own pet passport | Yes | When authorised | When authorised | According to backend permissions |
| Switch owner's pets | Yes | Not owner-specific by default | No | No |
| Edit pet profile | Where pets API permits | Only if authorised | Only if authorised | According to backend |
| View medical records | Yes | Yes when authorised | Yes when authorised | According to backend |
| Create medical record | No | Yes | Existing backend rules | Existing backend rules |
| Record vaccination | No | Yes | Existing backend rules | Existing backend rules |
| Create prescription | No | Yes | Existing backend rules | Existing backend rules |
| Upload record attachment | No/only if current API permits | Yes | Existing backend rules | Existing backend rules |
| Print passport | Yes | Yes if authorised | Yes if authorised | According to backend |
| Show QR | Yes | Read-only if authorised | Read-only if authorised | According to backend |

This table is a UI planning guide.

The backend remains the authority.

---

# 45. Acceptance criteria

The feature is complete when all of the following are true.

## Authentication

- Unauthenticated users cannot access the passport.
- Session expiry is handled safely.

## Multi-pet

- An owner can switch between multiple pets.
- Switching pets never displays mixed/stale medical data.

## Identity

- Pet identity renders from real backend data.
- Missing optional fields are handled gracefully.

## Health data

- Medical records render from backend data.
- Vaccinations render from backend data.
- Prescriptions render from backend data.
- Appointments render from backend data.
- Weight history renders from backend data.
- Reminders render from backend data where available.

## Permissions

- Owners cannot perform protected clinical mutations.
- Authorised vets can access supported medical creation actions.
- The server rejects unauthorised mutations even if the UI is bypassed.

## UX

- Critical information is visible without opening multiple tabs.
- Empty states exist.
- Loading states exist.
- Errors are understandable.
- Mobile layout works.
- Dark mode works.

## Internationalisation

- New UI is available in Vietnamese and English.

## Reuse

- Existing `PetPassport`, tRPC, Prisma, auth, upload, and design-system code is reused where practical.
- The implementation does not create duplicate domain models unnecessarily.

---

# 46. Coding-agent implementation order

Follow this order.

## Step 1 — Inspect existing code

Locate:

- Existing `PetPassport` component
- `pets` router
- `medical` router
- `appointments` router
- `reminders` router
- Auth/session helpers
- Role helpers
- Prisma pet relations
- Translation structure
- Upload/attachment handling

Document actual API names before coding.

## Step 2 — Create protected pet passport route

Implement:

```text
/[locale]/dashboard/pets/[petId]
```

Validate:

- session
- locale
- petId
- access

## Step 3 — Pet list and switcher

Use authenticated pet listing API.

## Step 4 — Identity header

Render existing pet profile data.

## Step 5 — Health summary

Derive statuses from real records.

## Step 6 — Main tabs

Create accessible responsive tab structure.

## Step 7 — Medical records

Render real records.

Then wire authorised create action.

## Step 8 — Vaccinations

Render real vaccinations and due status.

Then wire authorised create action.

## Step 9 — Prescriptions

Render real prescriptions.

Then wire authorised create action.

## Step 10 — Appointments

Render past/upcoming appointments.

## Step 11 — Weight history

Build simple responsive chart using the project's existing chart dependency if available.

Do not add a heavy new chart library before checking dependencies.

## Step 12 — Reminders/upcoming care

Reuse current reminder API.

## Step 13 — Documents

Reuse medical attachments.

## Step 14 — QR and print

Reuse existing passport capabilities.

Do not implement insecure public sharing.

## Step 15 — i18n

Add English/Vietnamese strings.

## Step 16 — harden UX

Add:

- skeletons
- empty states
- error states
- toast feedback
- access-denied handling
- mobile polish
- dark mode

## Step 17 — testing

Test:

- owner with one pet
- owner with multiple pets
- owner with no pets
- veterinarian
- invalid pet ID
- pet owned by another user
- pet with no medical history
- pet with extensive history
- expired session
- failed mutation
- mobile
- desktop
- English
- Vietnamese

---

# 47. Important coding instructions

- Use existing project conventions.
- Do not rewrite working authentication.
- Do not create a second pet domain model.
- Do not duplicate the existing `PetPassport` component without first evaluating whether it should be extended.
- Use actual database/API field names.
- Keep TypeScript strict.
- Do not use `any` to bypass incorrect typing.
- Validate mutation input.
- Keep permission checks on the server.
- Keep components reasonably small.
- Reuse common status/date helpers.
- Avoid giant components containing the entire passport.
- Preserve locale in all links.
- Keep comments useful and minimal.
- Do not hard-code sample medical data into the production passport.
- Sample data is acceptable only in tests/stories/fixtures.
- Do not expose another owner's pet by changing the URL manually.
- Do not invent clinical conclusions from raw records.
- Do not create fake buttons that appear to work but have no backend action.
- If a desired field is not present in the schema, clearly mark it as a future schema requirement rather than silently simulating it.

---

# 48. Product goal

The finished page should make PetCare's Digital Pet Passport feel like the central health record for each pet.

An owner should be able to open the page and quickly answer:

- Which pet am I viewing?
- Is their vaccination status current?
- Are they taking medication?
- When did they last see a vet?
- What happened during previous visits?
- What is their current weight?
- When is their next appointment?
- What care is due next?
- Where are their medical documents?

A veterinarian should be able to quickly answer:

- Is this the correct pet?
- What relevant health history is already recorded?
- What vaccinations has the pet received?
- What medication has been prescribed?
- What happened during recent veterinary visits?
- What supporting documents exist?
- What clinical information can I safely add through my role?

If those questions can be answered quickly without exposing data to unauthorised users, the passport is fulfilling its purpose.
