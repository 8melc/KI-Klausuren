# KORREKTURPILOT TECH-STACK REPORT

**Datum:** $(date)  
**Projekt:** klausur-mvp (KorrekturPilot)  
**Status:** Vollständiges MVP, produktionsbereit

---

## 1. FRAMEWORK & VERSION

```
Framework: Next.js 16.0.8
Router: App Router
Language: TypeScript 5.x
React: 19.2.1
Node.js: ES2017+
```

### Details
- **Next.js:** Version 16.0.8 (App Router)
- **TypeScript:** Version 5.x (strict mode)
- **React:** Version 19.2.1
- **Build System:** Turbopack (experimental)

---

## 2. FOLDER STRUCTURE

```
/klausur-mvp/
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API Routes
│   │   ├── analyze/              # KI-Analyse Route
│   │   ├── auth/                 # Auth Refresh
│   │   ├── build-teacher-summary/ # Lehrer-Zusammenfassung
│   │   ├── checkout/             # Checkout Handler
│   │   ├── corrections/          # Korrekturen CRUD
│   │   ├── credits/              # Credits Management
│   │   ├── expectation-horizon/  # Erwartungshorizont
│   │   ├── extract/              # PDF-Extraktion
│   │   ├── extract-klausur/      # Klausur-Extraktion
│   │   ├── generate-doc/         # Word-Dokument Generation
│   │   ├── generate-feedback-pdf/ # Feedback PDF
│   │   ├── generate-pdf/         # PDF Generation
│   │   ├── grade/                # Bewertung
│   │   ├── profile/              # User Profile Management
│   │   ├── stripe/               # Stripe Integration
│   │   │   ├── checkout/         # Checkout Session
│   │   │   ├── prices/           # Preis-Abfrage
│   │   │   └── webhook/          # Webhook Handler
│   │   ├── upload-url/           # Upload URL Generation
│   │   └── webhooks/             # Alternative Webhooks
│   ├── auth/                     # Auth Pages
│   │   └── callback/             # OAuth Callback
│   ├── agb/                      # AGB Page
│   ├── beispielauswertung/       # Beispiel-Auswertung
│   ├── checkout/                 # Checkout Pages
│   ├── correction/               # Haupt-Korrektur-Seite
│   ├── dashboard/                # Dashboard
│   ├── datenschutz/              # Datenschutz
│   ├── ergebnisse/               # Ergebnisse
│   ├── expectation/              # Erwartungshorizont (Redirect)
│   ├── hilfe-upload/             # Hilfe-Upload
│   ├── impressum/                # Impressum
│   ├── profil/                   # Profil
│   ├── reset-password/           # Password Reset
│   ├── results/                  # Ergebnisse
│   ├── upload/                   # Upload (Redirect)
│   ├── layout.tsx                # Root Layout
│   ├── page.tsx                  # Homepage
│   └── providers.tsx             # Root Provider
├── components/                   # React Components
│   ├── dashboard/                # Dashboard Components
│   ├── icons/                    # Icon Components
│   ├── profile/                  # Profile Components
│   ├── beispielauswertung/       # Beispiel Components
│   ├── ui/                       # UI Primitives
│   ├── AppFooter.tsx             # Footer
│   ├── AppHeader.tsx             # Header
│   ├── AuthButton.tsx            # Auth Button
│   ├── AuthForm.tsx              # Auth Form
│   ├── AuthProvider.tsx          # Auth Context
│   ├── ProtectedRoute.tsx        # Route Protection
│   └── [weitere Components...]
├── lib/                          # Utility Libraries
│   ├── supabase/                 # Supabase Clients
│   │   ├── client.ts             # Browser Client
│   │   ├── server.ts             # Server Client
│   │   ├── error-handler.ts      # Error Handling
│   │   └── session-validator.ts  # Session Validation
│   ├── analysis/                 # KI-Analyse Logic
│   │   ├── controller.ts         # Master Controller
│   │   ├── mapper.ts             # Data Mapping
│   │   ├── prompts/              # AI Prompts
│   │   ├── types.ts              # Types
│   │   ├── validator.ts          # Validation
│   │   └── [weitere...]
│   ├── renderers/                # PDF Renderer
│   ├── auth.ts                   # Auth Helpers
│   ├── dashboard.ts              # Dashboard Logic
│   ├── openai.ts                 # OpenAI Client
│   ├── pdf.ts                    # PDF Processing
│   ├── stripe.ts                 # Stripe Client
│   ├── subscription.ts           # Subscription Logic
│   └── user-credits.ts           # Credits Management
├── supabase/                     # Database Migrations
│   └── migrations/               # SQL Migrations
│       ├── 001_create_stripe_tables.sql
│       ├── 002_create_corrections_table.sql
│       ├── 003_alter_corrections_id_to_text.sql
│       ├── 004_create_user_profile_tables.sql
│       ├── 004_create_users_table_with_credits.sql
│       ├── 005_fix_security_definer_functions.sql
│       ├── 006_create_storage_policies.sql
│       ├── 007_add_stripe_customer_id.sql
│       ├── 008_add_profile_fields_to_users.sql
│       └── 009_ensure_users_update_policy.sql
├── types/                        # TypeScript Types
│   ├── analysis.ts               # Analysis Types
│   ├── results.ts                # Results Types
│   └── node-poppler.d.ts         # Poppler Types
├── hooks/                        # Custom React Hooks
│   ├── useAnalysisQueue.ts       # Analysis Queue
│   └── useUploadQueue.ts         # Upload Queue
├── public/                       # Static Assets
├── examples/                     # Example Files
└── [config files...]
```

---

## 3. SUPABASE INTEGRATION

### Supabase Features genutzt:
- ✅ **Auth** (Authentifizierung) - Email/Password, OAuth (Google)
- ✅ **Database** (PostgreSQL) - Full CRUD Operations
- ✅ **Storage** (File-Upload) - Policies vorhanden
- ⬜ **Realtime** (Live-Updates) - Nicht verwendet
- ⬜ **Edge Functions** - Nicht verwendet

### Supabase Client Setup

**Browser Client:** `lib/supabase/client.ts`
```typescript
- Uses @supabase/ssr (Server-Side Rendering support)
- Singleton pattern für Client-Instanz
- PKCE Flow für OAuth
- Auto-refresh Session
- Session in Cookies gespeichert
```

**Server Client:** `lib/supabase/server.ts`
```typescript
- Server Components: createClient() mit cookies()
- API Routes: createClientFromRequest(request)
- Session Management über Cookies
```

### Database Schema

**Tabellen:**
1. **auth.users** (managed by Supabase Auth)
   - Automatisch erstellt durch Supabase

2. **public.users**
   - `id` (UUID, FK zu auth.users)
   - `credits` (INTEGER, DEFAULT 0)
   - `created_at`, `updated_at`
   - Trigger: Vergibt 1 kostenloses Credit bei Registrierung

3. **corrections**
   - `id` (TEXT, PRIMARY KEY)
   - `user_id` (UUID, FK zu auth.users)
   - `student_name`, `file_name`
   - `course_subject`, `course_grade_level`, `course_class_name`, `course_school_year`
   - `status` (pending, processing, completed, error)
   - `analysis` (JSONB)
   - `created_at`, `updated_at`

4. **expectation_horizons**
   - `id` (UUID, PRIMARY KEY)
   - `user_id` (UUID, FK zu auth.users)
   - `file_name`, `content` (TEXT)
   - `created_at`

5. **subscriptions** (Stripe)
   - `id` (UUID, PRIMARY KEY)
   - `user_id` (UUID, FK zu auth.users)
   - `stripe_subscription_id` (TEXT, UNIQUE)
   - `plan_type` (monthly, yearly)
   - `status` (TEXT)
   - `expires_at`, `created_at`, `updated_at`

6. **payments** (Stripe)
   - `id` (UUID, PRIMARY KEY)
   - `user_id` (UUID, FK zu auth.users)
   - `stripe_payment_intent_id` (TEXT, UNIQUE)
   - `amount` (BIGINT), `currency` (TEXT)
   - `status` (TEXT)
   - `created_at`

**Row Level Security (RLS):**
- Alle Tabellen haben RLS aktiviert
- Policies: Users können nur ihre eigenen Daten sehen/bearbeiten

**Functions:**
- `give_free_test_credit()` - Trigger-Funktion für 1 kostenloses Credit
- `add_credits(user_id, amount)` - RPC-Funktion für Credits-Hinzufügung

---

## 4. AUTHENTICATION FLOW

### Auth-Provider: **Supabase Auth**

**Login-Methoden:**
- ✅ **Email/Password** - Sign Up & Sign In
- ✅ **Magic Link** - Email-basierte Anmeldung
- ✅ **OAuth (Google)** - Google OAuth Integration
- ✅ **Password Reset** - Reset-Password Flow
- ⬜ **Anonymous** - Nicht unterstützt

### Session Management
- **Storage:** HTTP-only Cookies (via @supabase/ssr)
- **Flow:** PKCE (Proof Key for Code Exchange)
- **Auto-Refresh:** Ja, automatisches Token-Refresh
- **Session-Validierung:** Server-seitig mit `getUser()`

### Auth-Files

**Main Files:**
- `lib/supabase/client.ts` - Browser Client
- `lib/supabase/server.ts` - Server Client
- `components/AuthProvider.tsx` - React Context Provider
- `components/AuthButton.tsx` - Auth UI Component
- `components/AuthForm.tsx` - Email/Password Form
- `app/auth/callback/route.ts` - OAuth Callback Handler
- `lib/auth.ts` - Server-side Auth Helpers

**Auth Context:**
```typescript
- useAuth() Hook verfügbar
- Session, User, Loading States
- signOut() Funktion
```

**Protected Routes:**
- `components/ProtectedRoute.tsx` - Route Guard Component

---

## 5. STRIPE INTEGRATION

### Stripe Setup
- **Client Library:** `stripe` v20.0.0
- **Frontend:** `@stripe/stripe-js` v8.5.2
- **Server Client:** `lib/stripe.ts` - `getStripeServerClient()`

### Payment Flow
- ✅ **One-time Payments** - Credits-Pakete (z.B. 25 Credits für 7,90€)
- ✅ **Subscriptions** - Vorbereitet (Tabellen vorhanden)
- ✅ **Credits/Balance-System** - User-Credits in `users` Tabelle

### Stripe-Produkte
- **Package 25:** 25 Credits (Preis-ID: `NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25`)
- **One-Time:** Einmalige Zahlung (Preis-ID: `NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME`)

### Webhook Handler
- **Route:** `app/api/stripe/webhook/route.ts`
- **Events:**
  - `checkout.session.completed` - Credits hinzufügen nach erfolgreicher Zahlung
  - Erstellt Payment-Eintrag in `payments` Tabelle
  - Aktualisiert User-Credits

### Stripe Files
- `lib/stripe.ts` - Server Client Setup
- `app/api/stripe/checkout/route.ts` - Checkout Session Creation
- `app/api/stripe/prices/route.ts` - Preis-Abfrage
- `app/api/stripe/webhook/route.ts` - Webhook Handler
- `components/BuyCreditsButton.tsx` - UI Component
- `components/CheckoutSessionHandler.tsx` - Checkout Handler

---

## 6. UI COMPONENTS & STYLING

### UI-Library
- **Primitive Library:** Custom (keine Shadcn/Radix/MUI)
- **Icons:** `lucide-react` v0.561.0
- **Toast/Notifications:** `sonner` v2.0.7
- **CSS Utilities:** `tailwind-merge` v3.4.0, `clsx` v2.1.1

### Tailwind CSS
- **Version:** Tailwind CSS v4
- **Config:** PostCSS-basiert (`@tailwindcss/postcss`)
- **Custom CSS:** `app/globals.css` mit CSS-Variablen

### Component-Struktur

**UI Primitives:**
- `components/ui/button.tsx` - Button Component (Variants: default, destructive, outline, secondary, ghost, link)

**Reusable Components:**
- `AppHeader.tsx` - Navigation Header
- `AppFooter.tsx` - Footer
- `AuthButton.tsx` - Authentication Button
- `AuthForm.tsx` - Email/Password Form
- `UploadBox.tsx` - File Upload Component
- `ResultCard.tsx` - Result Display Card
- `ResultCompactView.tsx` - Compact Result View
- `ResultDetailClient.tsx` - Detailed Result View
- `DetailDrawer.tsx` - Drawer Component
- `StatusBox.tsx` - Status Display
- `CreditsDisplay.tsx` - Credits Counter
- `BuyCreditsButton.tsx` - Credits Purchase Button
- `ProtectedRoute.tsx` - Route Guard
- `CookieBanner.tsx` - GDPR Cookie Banner
- `WelcomeBanner.tsx` - Welcome Message
- `CourseSelectionBar.tsx` - Course Selection
- `CourseSelectionCard.tsx` - Course Card
- `Combobox.tsx` - Dropdown/Combobox
- `TeacherFeedbackDocument.tsx` - Feedback Document

**Dashboard Components:**
- `dashboard/StatsOverview.tsx`
- `dashboard/CorrectionsList.tsx`
- `dashboard/CorrectionsTimeline.tsx`
- `dashboard/CreditsCard.tsx`

**Profile Components:**
- `profile/ProfileTabs.tsx`
- `profile/PersonalInfoTab.tsx`
- `profile/PreferencesTab.tsx`
- `profile/SchoolClassesTab.tsx`

---

## 7. API ROUTES & BACKEND LOGIC

### API-Routes (App Router)

**Authentication:**
- `POST /api/auth/refresh` - Session Refresh

**Analysis & Processing:**
- `POST /api/extract` - PDF-Text-Extraktion (OpenAI Vision)
- `POST /api/extract-klausur` - Klausur-Extraktion
- `POST /api/analyze` - KI-Analyse (Master Analysis)
- `POST /api/build-teacher-summary` - Lehrer-Zusammenfassung
- `POST /api/grade` - Bewertung

**File Generation:**
- `POST /api/generate-pdf` - PDF-Generierung
- `POST /api/generate-feedback-pdf` - Feedback PDF
- `POST /api/generate-doc` - Word-Dokument (.docx)

**Data Management:**
- `GET/POST /api/corrections` - Korrekturen CRUD
- `POST /api/expectation-horizon` - Erwartungshorizont speichern
- `POST /api/upload-url` - Upload URL Generation (Uploadthing)

**User Management:**
- `GET/PUT /api/profile/update` - Profil aktualisieren
- `PUT /api/profile/change-email` - Email ändern
- `PUT /api/profile/change-password` - Passwort ändern
- `GET/PUT /api/profile/preferences` - Präferenzen

**Credits & Payments:**
- `POST /api/credits/add` - Credits hinzufügen
- `POST /api/checkout` - Checkout Session
- `POST /api/stripe/checkout` - Stripe Checkout
- `GET /api/stripe/prices` - Preis-Abfrage
- `POST /api/stripe/webhook` - Stripe Webhook Handler
- `POST /api/webhooks/stripe` - Alternative Webhook Route

**Example API Route:** `/api/analyze/route.ts`
- User-Authentifizierung prüfen
- Credits prüfen und abziehen
- OpenAI Master Analysis durchführen
- Korrekturen in DB speichern
- JSON-Response zurückgeben

---

## 8. ENVIRONMENT VARIABLES

### Required Environment Variables

**Supabase:**
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (für Webhooks)
```

**OpenAI:**
```
OPENAI_API_KEY=your-openai-api-key
```

**Stripe:**
```
STRIPE_SECRET_KEY=sk_test_... (oder sk_live_...)
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME=price_...
```

**Upload (Uploadthing):**
```
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
```

**Deployment:**
```
NEXT_PUBLIC_URL=https://your-domain.com (für Production)
VERCEL_URL=auto-set (Vercel Environment)
NODE_ENV=development | production
```

**Optional:**
```
AUTH_REQUIRED=true (default: true)
```

---

## 9. DATABASE SCHEMA (DETAILED)

### Tables Overview

1. **auth.users** (Supabase Managed)
   - Automatisch durch Supabase Auth erstellt
   - Enthält: id, email, encrypted_password, etc.

2. **public.users**
   ```sql
   - id (UUID, PK, FK → auth.users)
   - credits (INTEGER, DEFAULT 0)
   - created_at, updated_at (TIMESTAMPTZ)
   ```

3. **corrections**
   ```sql
   - id (TEXT, PK)
   - user_id (UUID, FK → auth.users)
   - student_name, file_name (TEXT)
   - course_subject, course_grade_level, course_class_name, course_school_year
   - status (pending, processing, completed, error)
   - analysis (JSONB)
   - created_at, updated_at
   ```

4. **expectation_horizons**
   ```sql
   - id (UUID, PK)
   - user_id (UUID, FK → auth.users)
   - file_name, content (TEXT)
   - created_at
   ```

5. **subscriptions**
   ```sql
   - id (UUID, PK)
   - user_id (UUID, FK → auth.users)
   - stripe_subscription_id (TEXT, UNIQUE)
   - plan_type (monthly, yearly)
   - status (TEXT)
   - expires_at, created_at, updated_at
   ```

6. **payments**
   ```sql
   - id (UUID, PK)
   - user_id (UUID, FK → auth.users)
   - stripe_payment_intent_id (TEXT, UNIQUE)
   - amount (BIGINT), currency (TEXT)
   - status (TEXT)
   - created_at
   ```

### Migrations
- **Anzahl:** 9 Migrations
- **Pfad:** `supabase/migrations/`
- **Letzte Migration:** `009_ensure_users_update_policy.sql`

---

## 10. STATE MANAGEMENT & DATA FETCHING

### State Management
- **Library:** React Context API (kein Zustand/Redux)
- **Context Providers:**
  - `AuthProvider` - Authentication State
  - `GradingProvider` - Grading Context (Placeholder)
  - `RootProvider` - Kombiniert alle Provider

### Data Fetching
- **Method:** Native `fetch()` API
- **Kein React Query/TanStack Query**
- **Kein SWR**
- **Server Actions:** Next.js Server Actions (experimental)

### State Management Pattern
- **Client Components:** `useState`, `useEffect` für lokalen State
- **Server Components:** Direct DB Queries mit Supabase
- **Auth State:** Context Provider (`AuthProvider`)
- **Session:** Supabase Client mit Auto-Refresh

---

## 11. DEPLOYMENT & BUILD

### Build Configuration

**next.config.ts:**
```typescript
- Server External Packages: sharp, node-poppler
- Turbopack: Enabled
- Server Actions: Body Size Limit 50mb
- Security Headers: X-Content-Type-Options, X-Frame-Options, etc.
```

### Deployment Platform
- **Platform:** Vercel (vermutlich, basierend auf VERCEL_URL env var)
- **Build Command:** `npm run build`
- **Start Command:** `npm start`

### Build Scripts
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

### Deployment Config
- Keine `.vercelignore` sichtbar
- Keine `.netlify.toml` sichtbar
- Vermutlich Vercel-basiert

---

## 12. HELPER FUNCTIONS & UTILITIES

### Utility Files (`lib/`)

**Supabase Utilities:**
- `lib/supabase/client.ts` - Browser Client
- `lib/supabase/server.ts` - Server Client
- `lib/supabase/error-handler.ts` - JWT Error Handling & Retry Logic
- `lib/supabase/session-validator.ts` - Session Validation

**Auth & User:**
- `lib/auth.ts` - Server-side Auth Helpers (`getCurrentUser()`)
- `lib/user-credits.ts` - Credits Management (add, subtract, get)
- `lib/subscription.ts` - Subscription Logic
- `lib/dashboard.ts` - Dashboard Data Fetching

**Analysis & AI:**
- `lib/openai.ts` - OpenAI Client & Analysis Functions
- `lib/analysis/controller.ts` - Master Analysis Controller
- `lib/analysis/mapper.ts` - Data Mapping
- `lib/analysis/prompts/` - AI Prompt Templates
- `lib/analysis/types.ts` - Type Definitions
- `lib/analysis/validator.ts` - Response Validation
- `lib/analysis-language-config.ts` - Language Configuration
- `lib/parse-analysis.ts` - Analysis Parsing
- `lib/parse-task-comment.ts` - Task Comment Parsing

**PDF & Documents:**
- `lib/pdf.ts` - PDF Processing (Vision-based extraction)
- `lib/pdf-generator.ts` - PDF Generation
- `lib/handwritten-pdf.ts` - Handwriting Detection
- `lib/generate-feedback-pdf.ts` - Feedback PDF Generation
- `lib/generate-feedback-doc.ts` - Feedback Document Generation
- `lib/downloadDoc.ts` - Document Download
- `lib/build-feedback-model.ts` - Feedback Model Builder
- `lib/build-teacher-feedback-model.ts` - Teacher Feedback Builder
- `lib/build-teacher-summary.ts` - Teacher Summary Builder

**Rendering:**
- `lib/renderers/student-renderer.ts` - Student PDF Renderer
- `lib/renderers/teacher-renderer.ts` - Teacher PDF Renderer

**Grading & Feedback:**
- `lib/grade-klausur.ts` - Grading Logic
- `lib/grades.ts` - Grade Utilities
- `lib/grading-schema.ts` - Grading Schema
- `lib/language-polisher.ts` - Language Polishing

**Stripe:**
- `lib/stripe.ts` - Stripe Server Client
- `lib/buy-credits.ts` - Credits Purchase Logic

**Course & UX:**
- `lib/course-suggestions.ts` - Course Suggestions
- `lib/school-year.ts` - School Year Utilities
- `lib/ux-helpers.ts` - UX Helper Functions

**General:**
- `lib/utils.ts` - General Utilities (cn, etc.)
- `lib/demoData.ts` - Demo Data

---

## 13. KEY DEPENDENCIES

### Core Dependencies
```json
{
  "next": "^16.0.8",
  "react": "^19.2.1",
  "react-dom": "^19.2.1",
  "typescript": "^5"
}
```

### Backend & API
```json
{
  "@supabase/supabase-js": "^2.84.0",
  "@supabase/ssr": "^0.7.0",
  "@supabase/postgrest-js": "^2.87.1",
  "stripe": "^20.0.0",
  "@stripe/stripe-js": "^8.5.2",
  "openai": "^6.9.1",
  "@google/generative-ai": "^0.24.1"
}
```

### File Processing
```json
{
  "pdf-lib": "^1.17.1",
  "node-poppler": "^9.0.1",
  "docx": "^9.5.1",
  "sharp": "^0.34.5",
  "uploadthing": "^7.7.4",
  "@uploadthing/react": "^7.3.3"
}
```

### UI & Styling
```json
{
  "tailwindcss": "^4",
  "@tailwindcss/postcss": "^4",
  "tailwind-merge": "^3.4.0",
  "clsx": "^2.1.1",
  "lucide-react": "^0.561.0",
  "sonner": "^2.0.7"
}
```

---

## FINAL SUMMARY

### Tech-Stack Highlights

✅ **Frontend:**
- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Custom UI Components

✅ **Backend:**
- Next.js API Routes
- Supabase (Auth + Database)
- Stripe Payments
- OpenAI API

✅ **File Processing:**
- PDF: pdf-lib, node-poppler
- Word: docx
- Images: sharp
- Upload: Uploadthing

✅ **State Management:**
- React Context API
- No external state library

✅ **Deployment:**
- Vercel (vermutlich)
- Environment Variables konfiguriert

### Architecture Pattern
- **Full-Stack:** Next.js mit App Router
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth (Email/Password + OAuth)
- **Payments:** Stripe (One-time + Subscriptions vorbereitet)
- **File Storage:** Uploadthing (vermutlich) + Supabase Storage
- **AI:** OpenAI GPT-4o / GPT-4o-mini

### Production-Ready Features
- ✅ Authentication & Authorization
- ✅ Row Level Security (RLS)
- ✅ Credits System
- ✅ Payment Integration
- ✅ PDF/Document Generation
- ✅ Error Handling
- ✅ Session Management
- ✅ Protected Routes

---

**Ende des Reports**







