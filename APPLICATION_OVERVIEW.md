# PetCare Application Overview

## What this application is

PetCare is a bilingual pet healthcare platform designed for pet owners, veterinarians, and veterinary clinics in Vietnam. It brings common pet-care tasks into one application: finding veterinary care, responding to emergencies, keeping medical records, checking medicine safety, arranging consultations, managing reminders, and coordinating blood donation.

The application currently combines:

- Polished public-facing pages for pet owners
- Vietnamese and English localization
- Account and role-based backend infrastructure
- Veterinary clinic and emergency search
- AI-assisted first-aid guidance
- Digital pet health-record foundations
- Appointment, reminder, pharmacy, and blood-donation APIs
- Several demonstration interfaces that still use local sample data

> Medical information in the application is intended as reference or temporary first-aid guidance. It does not replace diagnosis or treatment from a qualified veterinarian.

## Intended users

The data model and authorization system support four user roles:

| Role | Purpose |
| --- | --- |
| Pet owner | Manage pets, appointments, records, reminders, and donor profiles |
| Veterinarian | Work with appointments, medical records, vaccinations, and prescriptions |
| Clinic administrator | Manage clinic information, queues, requests, and operating status |
| System administrator | Administrative access across the platform |

## Existing application pages

All user-facing routes are locale-prefixed with `/vi` or `/en`. Vietnamese is the default locale.

| Route | Existing experience | Current implementation status |
| --- | --- | --- |
| `/[locale]` | Marketing homepage with clinic discovery, digital passport, emergency care, reminders, tele-vet, and blood-donation messaging | Complete responsive UI using local curated content |
| `/[locale]/clinics` | Clinic search, species and status filters, distance or rating sorting, clinic cards, selection, calling, and an empty state | Interactive UI using local clinic data; the separate tRPC clinic and search APIs are available |
| `/[locale]/emergency` | Emergency call-to-action, nearby emergency clinics, first-aid topics, safety guidance, and links to the SOS assistant | Interactive UI using local page data; global SOS tools connect to backend services |
| `/[locale]/pharmacy` | Medicine search, category and species filters, dosage reference, medicine warnings, toxic-food guidance, and safety principles | Interactive UI using local reference data; pharmacy APIs and toxicology models also exist |
| `/[locale]/tele-vet` | Veterinarian profiles, specialties, availability, consultation options, booking buttons, and payment messaging | Demonstration UI using local sample data; booking buttons are not connected to a complete checkout flow |
| `/[locale]/blood-donor` | Blood types, urgent requests, donor eligibility, network statistics, and registration/request actions | Demonstration UI using local sample data; blood-donor APIs and database models exist |
| `/[locale]/dashboard/owner` | Authenticated owner overview, navigation dock, pet summary, appointments, reminders, vaccination status, and quick actions | Session-protected page with sample dashboard values; several linked child routes are not present yet |
| `/[locale]/login` | Email and password form, validation, social buttons, password visibility, and account navigation | UI validation and simulated submission only; not yet connected to the existing NextAuth sign-in flow |
| `/[locale]/register` | Owner or clinic account selection, personal details, password validation, terms agreement, and social registration buttons | UI validation and simulated submission only; account creation is not yet connected to the backend |

## Homepage experience

The homepage introduces the complete care journey and links users to the main product areas. Existing content includes:

- Clinic discovery
- Digital pet passports
- Emergency support
- Online veterinary consultation
- Care reminders
- Blood donation
- Featured clinic carousel
- Responsive light and dark themes
- GSAP-powered hero, image, and scroll interactions
- Reduced-motion support

## Clinic discovery

### Public clinic page

The clinic directory currently provides:

- Search by clinic name, address, or service
- Filtering by animal type
- Filtering by clinic status
- Sorting by distance or rating
- Verified, 24-hour, emergency, busy, and closed states
- Clinic services, ratings, review totals, distance, and phone details
- Selected-clinic information panel
- Responsive empty and reset states

The visible directory currently uses a local set of clinic records. Its map panel explicitly indicates that an interactive map connection is still in progress.

### Search backend

The repository also contains a PostgreSQL-backed clinic search system with:

- Vietnamese-friendly unaccented search
- Fuzzy matching through `pg_trgm`
- Search across clinic name, address, and city
- Typeahead suggestions
- Animal, 24-hour, and exotic-specialist filters
- PostGIS distance calculation when coordinates are supplied
- Nearby-clinic ordering by relevance and distance

## Emergency support

Emergency functionality is available in two forms.

### Emergency information page

The dedicated page includes:

- Emergency hotline and clinic actions
- Nearby emergency clinic cards
- Safe transport instructions
- Warnings about human medicine
- Guidance on what information or packaging to bring
- First-aid topics for bleeding, poisoning, breathing difficulty, trauma, heat illness, and seizures
- Clear veterinary disclaimer messaging
- Direct access to the persistent SOS assistant

### Persistent SOS assistant

The floating SOS control is available across the localized application and includes:

- Browser geolocation
- No assumed fallback location when geolocation is unavailable
- Nearest emergency clinic lookup through tRPC
- Distance, phone, and map links
- Loading and location-error states
- An AI first-aid chat panel

The AI triage endpoint uses Google Gemini through the Vercel AI SDK. It streams localized pet-health and first-aid guidance, preserves recent conversation context, prioritizes immediate veterinary care, and is explicitly instructed not to diagnose or prescribe medicine. When the owner shares a location, the endpoint can ground clinic recommendations with nearby verified clinic records from the application database.

## Pharmacy and toxicology

### Pharmacy page

The current pharmacy experience includes:

- Search by medicine name or description
- Medicine-category filters
- Animal-species filters
- Safety states such as directed use, caution, and do-not-use
- Reference dosage information
- A resettable no-results state
- Toxic-food warning marquee
- Responsive toxic-food accordion cards
- General medicine-safety guidance
- Links to clinic and emergency support

The displayed medicine and toxic-food content is maintained locally inside the page component.

### Pharmacy backend

The tRPC pharmacy router supports:

- Listing and filtering medicine records
- Retrieving toxic substances
- Checking whether a substance is toxic for a selected species

The database supports medicine brand names, generic names, dosage information, side effects, contraindications, prescription requirements, applicable species, toxic severity, symptoms, first-aid steps, antidotes, and references.

A separate `ToxicAlertModal` component exists for detailed toxicology warnings, symptoms, first-aid steps, antidote information, and emergency calling. It is not currently mounted by the redesigned pharmacy page.

## Tele-veterinary consultation

The tele-vet page currently presents:

- Veterinarian profiles
- Professional specialties and experience
- Availability states
- Ratings and consultation counts
- Video, audio, and chat consultation options
- Consultation pricing
- Booking calls-to-action
- A three-part explanation of the consultation process
- Payment-method messaging

The page is protected by authentication middleware. Its current profiles and booking interface are sample UI; real booking and payment actions are not fully connected on this page.

## Blood-donation network

The blood-donor area currently presents:

- Canine and feline blood-type information
- Recent urgent blood requests
- Request urgency, location, and time information
- Donor eligibility requirements
- Donor registration and emergency blood-request actions
- Network impact statistics

The visible page uses sample requests and statistics. Backend support already exists for:

- Registering a pet as a donor
- Donor eligibility data and review status
- Finding compatible donors by blood type, species, city, and location
- Clinic-created blood requests
- Donation alerts and donor responses

## Pet profiles and digital passports

The backend and shared `PetPassport` component support a substantial pet-health profile:

- Pet identity, species, breed, color, birth date, gender, and neuter status
- Microchip and passport numbers
- Profile image
- Blood type and current weight
- Weight history
- Vaccinations and future due dates
- Medical records and attachments
- Prescriptions
- Appointments
- Care reminders
- Blood-donor profile
- QR-code passport sharing
- Printable or downloadable passport behavior

The owner dashboard currently shows a sample pet summary. Dedicated pet-list, pet-detail, appointment, and reminder pages referenced by dashboard links are not present in the current route tree.

## Appointments and medical records

The tRPC backend contains authenticated workflows for:

- Listing a pet owner's appointments
- Viewing a clinic queue
- Booking an appointment
- Updating appointment status
- Cancelling an appointment
- In-person, video, audio, and chat consultation types
- Creating medical records
- Adding vaccinations
- Creating prescriptions
- Attaching uploaded files to medical records

Role checks restrict clinical record operations to veterinarians, clinic administrators, or system administrators.

## Reminders and notifications

Owners can be represented with reminders for:

- Vaccinations
- Medicine
- Appointments
- Grooming
- Weight checks
- Deworming
- Flea treatment
- Custom care tasks

The reminder API supports listing, creation, activation toggling, and deletion. New reminders schedule an Inngest event.

The Inngest reminder workflow can:

- Verify that a reminder is still active
- Create an in-app notification
- Send email through the Resend API when configured
- Record a placeholder push-notification result when a push token exists
- Mark reminders as sent
- Create and schedule the next recurring reminder

## Authentication and authorization

The backend authentication system uses NextAuth v5 with:

- Google OAuth
- Email and password credentials
- Password hashing with bcrypt
- Prisma database adapter
- JWT sessions
- User-role information in the session
- Active-user checks
- Automatic owner-role assignment for new OAuth users

Middleware protects `/dashboard`, `/tele-vet`, and `/blood-donor` routes by checking for an Auth.js session cookie.

Important current limitation: the redesigned login and registration forms still simulate submission and do not call these authentication services. The backend authentication foundation exists, but the forms need integration work.

## Internationalization

The application supports:

- Vietnamese (`vi`)
- English (`en`)

Every public application URL uses a locale prefix. `next-intl` supplies translation messages, localized navigation, locale-aware routing, and a Vietnamese fallback. Some older or demonstration pages still contain Vietnamese text directly in their page components and are not fully translated yet.

## Navigation and shared interface

The shared application shell includes:

- Fixed responsive navigation
- Active-route highlighting
- Desktop and mobile navigation states
- Locale switching
- Expandable global search
- Session-aware account controls
- Notification button
- Persistent SOS button
- Toast notifications
- Inter variable font
- Light and dark theme styles
- Responsive layouts
- Reduced-motion handling in the redesigned animated experiences

## Backend API surface

The application uses tRPC for typed client-server communication.

| Router | Existing operations |
| --- | --- |
| `pets` | List, retrieve, create, update, soft-delete, and add weight records |
| `clinics` | List, retrieve by slug, find nearby clinics, and update clinic status |
| `search` | Fuzzy clinic search and typeahead suggestions |
| `emergency` | Find nearest emergency clinics and list emergency clinics by city |
| `pharmacy` | List medicines, retrieve toxic substances, and check toxicity |
| `appointments` | Owner appointments, clinic queue, booking, status updates, and cancellation |
| `medical` | Medical records, vaccinations, prescriptions, and record attachments |
| `reminders` | List, create, toggle, and delete reminders |
| `bloodDonor` | Register donors, find compatible donors, and create blood requests |

Procedures are divided into public, authenticated, clinic-authorized, and system-administrator access levels.

## Data model

The Prisma schema uses PostgreSQL and includes PostGIS, `pg_trgm`, `unaccent`, and UUID extensions. Existing models cover:

- Users, OAuth accounts, sessions, verification tokens, and SMS OTP records
- Veterinarian profiles
- Clinics and geographic coordinates
- Pets and weight history
- Medical records and attachments
- Vaccinations and certificates
- Prescriptions
- Appointments and consultation types
- Reminders
- Blood-donor profiles, blood requests, and donation alerts
- Medicines and toxic substances
- User notifications

## Technology stack

### Frontend

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Inter variable font
- GSAP and ScrollTrigger
- Framer Motion
- Lucide icons
- Radix UI primitives
- Sonner notifications

### Backend and data

- tRPC
- Prisma ORM
- PostgreSQL
- PostGIS
- NextAuth v5
- Zod validation
- TanStack Query
- Inngest background jobs

### External-service foundations

- Google OAuth
- Google Gemini through the Vercel AI SDK
- UploadThing configuration for medical attachments
- Resend-compatible email delivery
- Web-push and VAPID environment configuration
- Stripe environment configuration
- Mapbox environment configuration

Some external services are configured at the environment or schema level but do not yet have a complete user-facing workflow.

## Current implementation summary

### Connected or substantially implemented

- Locale-prefixed routing and translation infrastructure
- Global responsive navigation
- Session-aware application shell
- PostgreSQL and Prisma domain model
- Typed tRPC API structure
- Role-based API authorization
- Clinic and emergency spatial search
- Global geolocation-based SOS clinic lookup
- Streaming AI first-aid endpoint
- Reminder scheduling and in-app notification creation
- Google and credential authentication backend
- Responsive homepage, clinics, emergency, and pharmacy experiences

### Present as UI, samples, or partial integrations

- Login and registration submission
- Tele-vet booking and payment
- Blood-donor page actions
- Owner-dashboard statistics and pet content
- Redesigned clinic and pharmacy pages using their database APIs
- Interactive clinic map
- Push-notification delivery
- Stripe checkout
- Dedicated pet, appointment, and reminder dashboard routes
- Full bilingual coverage on older pages

## Repository structure

```text
app/[locale]/              Localized pages and shared localized layout
app/api/                   Auth, tRPC, Inngest, and AI triage endpoints
components/                Feature, layout, authentication, and UI components
lib/                       Navigation, hooks, and homepage content
messages/                  English and Vietnamese translations
prisma/                    Database schema and seed data
server/api/routers/        Typed domain APIs
server/inngest/            Background reminder workflow
styles/                    Global styles and design tokens
public/fonts/              Self-hosted Inter variable font
public/images/             Application photography
tests/                     Existing homepage design tests
```

## Product direction represented by the repository

The repository is building toward a unified pet-health ecosystem rather than a single-purpose clinic directory. Its strongest foundation is the shared data and service layer connecting owners, pets, clinics, veterinarians, emergencies, medical history, medicine safety, appointments, and ongoing care reminders. The primary remaining work is integrating the polished page interfaces with the backend services that already exist and completing the linked dashboard workflows.
