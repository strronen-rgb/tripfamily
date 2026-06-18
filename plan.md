# LexOffice — Plan.md
## מערכת ניהול משרד עורכי דין (Law Office Management System)

**Consolidating 6 separate apps into one unified platform**

---

## 1. Overview

### What We're Building

A single full-stack web application that replaces 6 standalone tools used by the same law office:

| Existing Repo | What It Does | Module in LexOffice |
|---|---|---|
| `Low_Office_App` | Client management (מערכת ניהול לקוחות משפטיים) | Clients |
| `Attornes_fees` | Attorney fee agreement generator (הסכם שכר טרחה) | Fee Agreements |
| `Attorneys-fees-Monthly` | Monthly fee calculator (חישוב שכר טרחה חודשי) | Monthly Billing |
| `Payment_deploy` | Payment spread agreement (הסכם פריסת תשלומים) | Payment Plans |
| `debtflow` | Debt tracking and flow management | Debt Flow |
| `whatsapp-agent` | Python WhatsApp bot for client communication | WhatsApp |

### Why Unify?

- All 6 apps share the same clients — currently there's no link between them
- Staff must switch between 6 different apps for one client
- No shared audit trail, no cross-module reporting
- Duplicate client data entry across apps
- Inconsistent UI and Hebrew/RTL handling

### Core Principles

- **Hebrew-first**: RTL layout, Hebrew UI labels, ILS currency, Israeli date formats
- **Clients are central**: every record links back to a client
- **PDF generation**: fee agreements and payment plans must produce signed-quality Hebrew PDFs
- **WhatsApp as the communication layer**: clients interact via WhatsApp; staff manages from the web
- **No over-engineering**: plain Server Actions, no GraphQL, no microservices beyond the Python bot

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, Server Actions, API routes in one repo |
| Language | TypeScript | Type safety across the whole stack |
| Styling | Tailwind CSS + `tailwindcss-rtl` plugin | RTL-aware utilities (`ps-*`, `pe-*`) |
| Database | Supabase (PostgreSQL) | Managed Postgres + Auth + Storage + Realtime |
| Auth | Supabase Auth (email/password) | Simple, built-in, integrated with RLS |
| File Storage | Supabase Storage | PDF documents, uploaded files |
| PDF Generation | `@react-pdf/renderer` | Server-side Hebrew RTL PDF rendering |
| Realtime | Supabase Realtime | Live WhatsApp chat updates without polling |
| Charts | Recharts | Debt balance over time |
| Excel Export | `xlsx` | Monthly billing export |
| WhatsApp | Meta WhatsApp Cloud API | Official webhook-based messaging |
| Python Bot | FastAPI microservice | AI/NLP responses, kept minimal |
| Hosting | Vercel (Next.js) + Render (Python) | Same setup as existing apps |

---

## 3. App Name & Navigation

**App Name**: `LexOffice`
**Subtitle**: `מערכת ניהול משרד עורכי דין`

### Sidebar Navigation (RTL, right-side)

```
┌─────────────────────────────────┐
│  ⚖  LexOffice                   │
│     משרד עורכי דין              │
├─────────────────────────────────┤
│  📊  לוח בקרה      /dashboard   │
│  👥  לקוחות        /clients     │
│  📄  שכר טרחה      /fees        │
│  📅  חיוב חודשי    /monthly     │
│  💳  פריסת תשלומים /payments    │
│  📈  תזרים חובות   /debtflow    │
│  💬  ווצאפ          /whatsapp   │
├─────────────────────────────────┤
│  ⚙️  הגדרות        /settings    │
└─────────────────────────────────┘
```

- Desktop: persistent right sidebar, icon + label
- Tablet/Mobile: collapses to icon-only, hamburger toggle
- Active module highlighted; sub-items expand inline

---

## 4. Database Schema (Supabase / PostgreSQL)

### Design Rules

- All monetary values stored as `integer` (agorot — 100 agorot = 1 ILS) to avoid floating-point errors
- Soft deletes via `archived_at` on all client-facing records (no hard deletes for legal records)
- `created_by uuid REFERENCES auth.users` on every table (audit + multi-user readiness)
- Row-Level Security (RLS): authenticated staff see all rows; clients (future phase) see only their own
- Timestamps: all `timestamptz`, stored UTC, displayed in `Asia/Jerusalem`

---

### Table: `clients`
Central entity. Everything else links here.

```sql
CREATE TABLE clients (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  file_number   text        UNIQUE NOT NULL,           -- מספר תיק פנימי
  full_name     text        NOT NULL,                  -- שם מלא
  id_number     text        UNIQUE,                    -- ת.ז. / ח.פ.
  entity_type   text        CHECK (entity_type IN ('individual', 'company')),
  phone         text,
  phone2        text,
  email         text,
  address       text,
  city          text,
  notes         text,
  status        text        NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'inactive', 'archived')),
  created_by    uuid        REFERENCES auth.users,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  archived_at   timestamptz
);
CREATE INDEX ON clients (full_name);
CREATE INDEX ON clients (phone);
```

---

### Table: `cases`
A client can have multiple legal cases.

```sql
CREATE TABLE cases (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid        NOT NULL REFERENCES clients ON DELETE RESTRICT,
  case_number     text,                                -- מספר תיק בית משפט
  case_type       text,                                -- סוג ייצוג (e.g. גירושין, פלילי)
  court           text,
  opposing_party  text,
  status          text        NOT NULL DEFAULT 'open'
                              CHECK (status IN ('open', 'closed', 'on_hold')),
  opened_at       date,
  closed_at       date,
  notes           text,
  created_by      uuid        REFERENCES auth.users,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON cases (client_id);
```

---

### Table: `fee_agreements`
Replaces `Attornes_fees`. Stores the agreement data; PDFs are stored in Supabase Storage.

```sql
CREATE TABLE fee_agreements (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           uuid        NOT NULL REFERENCES clients ON DELETE RESTRICT,
  case_id             uuid        REFERENCES cases,
  agreement_date      date        NOT NULL,
  agreement_type      text        NOT NULL
                                  CHECK (agreement_type IN ('fixed','hourly','success','combined')),
  fixed_amount        integer,                         -- באגורות
  hourly_rate         integer,                         -- באגורות לשעה
  success_percentage  numeric(5,2),                    -- אחוז הצלחה
  minimum_fee         integer,                         -- שכ"ט מינימלי
  vat_included        boolean     NOT NULL DEFAULT false,
  payment_terms       text,
  special_clauses     text,
  signed_at           timestamptz,
  document_url        text,                            -- Supabase Storage path
  status              text        NOT NULL DEFAULT 'draft'
                                  CHECK (status IN ('draft','sent','signed','cancelled')),
  created_by          uuid        REFERENCES auth.users,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON fee_agreements (client_id);
CREATE INDEX ON fee_agreements (status);
```

---

### Table: `monthly_fee_entries`
Replaces `Attorneys-fees-Monthly`. One row per client per month.

```sql
CREATE TABLE monthly_fee_entries (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid        NOT NULL REFERENCES clients ON DELETE RESTRICT,
  case_id         uuid        REFERENCES cases,
  month           date        NOT NULL,               -- first day of month
  hours_worked    numeric(6,2),
  hourly_rate     integer,                            -- can override client's default
  fixed_fee       integer     DEFAULT 0,
  expenses        integer     DEFAULT 0,
  total_billed    integer,                            -- computed: (hours*rate)+fixed+expenses
  invoice_number  text,
  invoice_date    date,
  paid_at         date,
  notes           text,
  created_by      uuid        REFERENCES auth.users,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, case_id, month)
);
```

---

### Table: `payment_plans`
Replaces `Payment_deploy`. Master record for a spread agreement.

```sql
CREATE TABLE payment_plans (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           uuid        NOT NULL REFERENCES clients ON DELETE RESTRICT,
  case_id             uuid        REFERENCES cases,
  fee_agreement_id    uuid        REFERENCES fee_agreements,
  total_amount        integer     NOT NULL,            -- סה"כ סכום לפריסה
  down_payment        integer     NOT NULL DEFAULT 0,  -- מקדמה
  num_installments    integer     NOT NULL,
  installment_amount  integer,                         -- computed
  start_date          date        NOT NULL,
  frequency           text        NOT NULL DEFAULT 'monthly'
                                  CHECK (frequency IN ('weekly','biweekly','monthly')),
  interest_rate       numeric(5,2) NOT NULL DEFAULT 0,
  document_url        text,                            -- signed PDF path
  status              text        NOT NULL DEFAULT 'active'
                                  CHECK (status IN ('draft','active','completed','cancelled')),
  notes               text,
  created_by          uuid        REFERENCES auth.users,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
```

---

### Table: `payment_installments`
Child rows auto-generated when a payment plan is created.

```sql
CREATE TABLE payment_installments (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id         uuid        NOT NULL REFERENCES payment_plans ON DELETE CASCADE,
  installment_num integer     NOT NULL,
  due_date        date        NOT NULL,
  amount          integer     NOT NULL,
  paid_at         date,
  paid_amount     integer,
  payment_method  text,                               -- מזומן / העברה / שיק
  receipt_number  text,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan_id, installment_num)
);
CREATE INDEX ON payment_installments (plan_id);
CREATE INDEX ON payment_installments (due_date);
```

---

### Table: `debt_flows`
Replaces `debtflow`. Master debt record.

```sql
CREATE TABLE debt_flows (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid        NOT NULL REFERENCES clients ON DELETE RESTRICT,
  case_id         uuid        REFERENCES cases,
  creditor        text,
  debtor          text,
  original_amount integer     NOT NULL,               -- חוב מקורי
  current_balance integer     NOT NULL,               -- יתרה נוכחית (updated by triggers)
  interest_rate   numeric(5,2) NOT NULL DEFAULT 0,
  start_date      date,
  last_update     date,
  status          text        NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active','partial','settled','written_off')),
  notes           text,
  created_by      uuid        REFERENCES auth.users,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
```

---

### Table: `debt_transactions`
Ledger events against a debt (payments, interest accruals, adjustments).

```sql
CREATE TABLE debt_transactions (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_flow_id      uuid        NOT NULL REFERENCES debt_flows ON DELETE CASCADE,
  transaction_date  date        NOT NULL,
  amount            integer     NOT NULL,             -- positive = payment/credit, negative = charge
  transaction_type  text        NOT NULL
                                CHECK (transaction_type IN ('payment','interest','fee','adjustment','writeoff')),
  description       text,
  created_by        uuid        REFERENCES auth.users,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON debt_transactions (debt_flow_id);
```

---

### Table: `whatsapp_conversations`
One conversation per client phone number.

```sql
CREATE TABLE whatsapp_conversations (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid        REFERENCES clients,     -- nullable until matched
  phone_number    text        NOT NULL UNIQUE,
  status          text        NOT NULL DEFAULT 'open'
                              CHECK (status IN ('open','closed','bot','escalated')),
  last_message_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
```

---

### Table: `whatsapp_messages`
All inbound and outbound messages.

```sql
CREATE TABLE whatsapp_messages (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   uuid        NOT NULL REFERENCES whatsapp_conversations ON DELETE CASCADE,
  direction         text        NOT NULL CHECK (direction IN ('inbound','outbound')),
  body              text,
  media_url         text,
  wa_message_id     text        UNIQUE,               -- Meta message ID (dedup)
  status            text        NOT NULL DEFAULT 'delivered'
                                CHECK (status IN ('sent','delivered','read','failed')),
  sender            text,                             -- 'bot', 'staff:<user_id>', or phone
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON whatsapp_messages (conversation_id, created_at);
```

---

### Table: `documents`
Shared document store for all generated and uploaded files.

```sql
CREATE TABLE documents (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     uuid        REFERENCES clients,
  case_id       uuid        REFERENCES cases,
  doc_type      text,                                 -- 'fee_agreement','payment_plan','invoice','other'
  title         text        NOT NULL,
  storage_path  text        NOT NULL,                 -- Supabase Storage bucket/path
  mime_type     text,
  size_bytes    integer,
  created_by    uuid        REFERENCES auth.users,
  created_at    timestamptz NOT NULL DEFAULT now()
);
```

---

### Table: `activity_log`
Append-only audit trail — never update, never delete rows here.

```sql
CREATE TABLE activity_log (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type   text        NOT NULL,                 -- 'client','case','fee_agreement', etc.
  entity_id     uuid        NOT NULL,
  action        text        NOT NULL,                 -- 'created','updated','signed','sent','paid'
  metadata      jsonb,                                -- diff or contextual data
  performed_by  uuid        REFERENCES auth.users,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON activity_log (entity_type, entity_id);
CREATE INDEX ON activity_log (created_at DESC);
```

---

### Entity Relationship Summary

```
auth.users
    │
    ▼
clients ──────────────────────────┐
    │                             │
    ├──▶ cases                    │
    │       │                     │
    │       ├──▶ fee_agreements ──┤
    │       │       │             │
    │       │       └──▶ payment_plans ──▶ payment_installments
    │       │                     │
    │       ├──▶ monthly_fee_entries
    │       │                     │
    │       └──▶ debt_flows ──▶ debt_transactions
    │                             │
    └──▶ whatsapp_conversations ──┘
              │
              └──▶ whatsapp_messages

documents  (linked to clients + cases)
activity_log  (linked to any entity)
```

---

## 5. Folder Structure

```
lexoffice/
├── app/
│   ├── layout.tsx                        # Root: dir="rtl", Hebrew font, Supabase provider
│   ├── globals.css                       # Tailwind base + RTL resets
│   ├── (auth)/
│   │   ├── layout.tsx                    # Auth-only layout (no sidebar)
│   │   └── login/
│   │       └── page.tsx                  # Email + password login
│   └── (app)/
│       ├── layout.tsx                    # Sidebar shell + auth guard
│       ├── dashboard/
│       │   └── page.tsx                  # KPI cards + activity feed
│       ├── clients/
│       │   ├── page.tsx                  # Searchable client list
│       │   ├── new/
│       │   │   └── page.tsx              # Create client form
│       │   └── [id]/
│       │       ├── page.tsx              # Client overview (tabs)
│       │       ├── edit/
│       │       │   └── page.tsx
│       │       ├── cases/
│       │       │   └── page.tsx          # Cases list for client
│       │       ├── fees/
│       │       │   └── page.tsx          # Fee agreements for client
│       │       ├── payments/
│       │       │   └── page.tsx          # Payment plans for client
│       │       └── whatsapp/
│       │           └── page.tsx          # WhatsApp history for client
│       ├── fees/
│       │   ├── page.tsx                  # All agreements (grouped by status)
│       │   ├── new/
│       │   │   └── page.tsx              # Multi-step agreement generator
│       │   └── [id]/
│       │       ├── page.tsx              # Agreement detail + PDF preview
│       │       └── edit/
│       │           └── page.tsx
│       ├── monthly/
│       │   ├── page.tsx                  # Month/year picker → client grid
│       │   └── [clientId]/
│       │       └── page.tsx              # Per-client monthly detail
│       ├── payments/
│       │   ├── page.tsx                  # All plans + overdue summary
│       │   ├── new/
│       │   │   └── page.tsx              # Payment plan generator
│       │   └── [id]/
│       │       ├── page.tsx              # Plan detail + installment tracker
│       │       └── edit/
│       │           └── page.tsx
│       ├── debtflow/
│       │   ├── page.tsx                  # Debt dashboard + all debts list
│       │   ├── new/
│       │   │   └── page.tsx
│       │   └── [id]/
│       │       ├── page.tsx              # Debt ledger + balance chart
│       │       └── transactions/
│       │           └── new/
│       │               └── page.tsx      # Add transaction (payment, interest, etc.)
│       ├── whatsapp/
│       │   ├── page.tsx                  # Conversation list (inbox)
│       │   └── [conversationId]/
│       │       └── page.tsx              # Chat window
│       └── settings/
│           └── page.tsx                  # App settings, user management
├── api/
│   ├── webhooks/
│   │   └── whatsapp/
│   │       └── route.ts                  # POST — receives Meta WA webhook events
│   ├── clients/
│   │   ├── route.ts                      # GET (list/search), POST (create)
│   │   └── [id]/
│   │       └── route.ts                  # GET, PATCH, DELETE (archive)
│   ├── fees/
│   │   ├── route.ts
│   │   └── [id]/
│   │       ├── route.ts
│   │       └── generate-pdf/
│   │           └── route.ts              # GET — returns PDF binary
│   ├── payments/
│   │   ├── route.ts
│   │   └── [id]/
│   │       ├── route.ts
│   │       └── generate-pdf/
│   │           └── route.ts
│   ├── monthly/
│   │   └── route.ts
│   ├── debtflow/
│   │   ├── route.ts
│   │   └── [id]/
│   │       └── transactions/
│   │           └── route.ts
│   └── whatsapp/
│       ├── send/
│       │   └── route.ts                  # POST — staff sends a message
│       └── conversations/
│           └── route.ts
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx                  # Sidebar + main content wrapper
│   │   ├── Sidebar.tsx                   # Navigation with active state
│   │   └── TopBar.tsx                    # Page title + user menu
│   ├── clients/
│   │   ├── ClientCard.tsx
│   │   ├── ClientForm.tsx
│   │   ├── ClientSearch.tsx
│   │   └── ClientStatusBadge.tsx
│   ├── fees/
│   │   ├── FeeAgreementForm.tsx          # Multi-step form
│   │   ├── FeeAgreementPreview.tsx       # Rendered preview before PDF
│   │   └── AgreementTypePicker.tsx
│   ├── payments/
│   │   ├── PaymentPlanForm.tsx
│   │   ├── InstallmentTable.tsx
│   │   └── InstallmentRow.tsx            # Row with "Mark Paid" action
│   ├── monthly/
│   │   ├── MonthPicker.tsx
│   │   ├── MonthlyGrid.tsx
│   │   └── BillingRow.tsx
│   ├── debtflow/
│   │   ├── DebtSummaryCard.tsx
│   │   ├── DebtLedger.tsx
│   │   ├── DebtChart.tsx                 # Recharts balance over time
│   │   └── AddTransactionForm.tsx
│   ├── whatsapp/
│   │   ├── ConversationList.tsx
│   │   ├── ConversationItem.tsx
│   │   └── ChatWindow.tsx                # Realtime message list + send box
│   └── ui/                               # Reusable primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Textarea.tsx
│       ├── Modal.tsx
│       ├── Badge.tsx
│       ├── Table.tsx
│       ├── DatePicker.tsx
│       ├── CurrencyInput.tsx             # Handles agorot ↔ ILS display
│       ├── Skeleton.tsx                  # Loading states
│       └── EmptyState.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # createBrowserClient (use client components)
│   │   ├── server.ts                     # createServerClient (Server Components + Actions)
│   │   └── middleware.ts                 # Session refresh
│   ├── actions/                          # Next.js Server Actions
│   │   ├── clients.ts                    # createClient, updateClient, archiveClient
│   │   ├── fees.ts                       # createFeeAgreement, updateStatus, signAgreement
│   │   ├── payments.ts                   # createPaymentPlan, markInstallmentPaid
│   │   ├── monthly.ts                    # upsertMonthlyEntry, markInvoicePaid
│   │   └── debtflow.ts                   # createDebtFlow, addTransaction
│   ├── hooks/
│   │   ├── useClients.ts
│   │   ├── useFeeAgreements.ts
│   │   ├── usePaymentPlans.ts
│   │   └── useRealtimeMessages.ts        # Supabase Realtime subscription
│   ├── pdf/
│   │   ├── fonts.ts                      # Register Heebo TTF for react-pdf
│   │   ├── feeAgreementTemplate.tsx      # React-PDF component
│   │   └── paymentPlanTemplate.tsx       # React-PDF component
│   ├── whatsapp.ts                       # Meta Cloud API send + signature verify helpers
│   ├── formatting.ts                     # ILS currency, Hebrew dates, phone normalization
│   └── constants.ts                      # Status arrays, entity types, etc.
├── middleware.ts                         # Supabase auth + session refresh
├── tailwind.config.ts
├── next.config.ts
└── .env.local                            # Supabase, WA API, Python agent URL
```

---

## 6. Pages & Features — Detailed Breakdown

### Dashboard `/dashboard`

**Purpose**: Single-glance status of the entire office.

**Sections**:
- **KPI row** (4 cards):
  - Active clients count
  - Open fee agreements (draft + sent)
  - Overdue installments (due_date < today AND paid_at IS NULL)
  - Total open debt balance (sum of `current_balance` on active debt_flows)
- **Overdue installments table**: client name, plan, amount, days overdue, WhatsApp action button
- **Recent activity feed**: last 20 rows from `activity_log`, grouped by date
- **Quick-add buttons**: shortcuts to `/clients/new`, `/fees/new`, `/payments/new`

---

### Clients `/clients`

**List page**:
- Search bar (real-time Supabase `ilike` on `full_name || id_number || file_number || phone`)
- Filter by status (active / inactive / archived)
- Table columns: file number, name, ID number, phone, status badge, last activity
- Pagination (20 per page)
- "New Client" button → `/clients/new`

**New / Edit form** (`/clients/new`, `/clients/[id]/edit`):
- All fields from the `clients` table
- File number auto-suggested (incrementing, editable)
- Validation: ID number format (9 digits), phone format
- Save via Server Action → redirects to client profile

**Client Profile** `/clients/[id]`:
- Header: name, file number, status badge, phone (click to call/WhatsApp), email
- Tab navigation:
  - **Overview**: notes, cases summary, last activity
  - **Cases**: list of cases + add case button
  - **Fee Agreements**: agreements list + generate new
  - **Payment Plans**: plans with progress bars + add new
  - **WhatsApp**: message history for this client's phone

---

### Fee Agreements `/fees`

**List page**:
- Grouped by status: Draft | Sent | Signed | Cancelled
- Each card: client name, agreement date, type, amount, action buttons
- Filter by client search

**Generator** `/fees/new` (multi-step):

```
Step 1: Select Client
  → Search/select existing client or link to case

Step 2: Agreement Type
  → Fixed fee (סכום קבוע)
  → Hourly rate (לפי שעות)
  → Success fee (אחוז הצלחה)
  → Combined (משולב)

Step 3: Financial Terms
  → Relevant fields based on type selected
  → VAT toggle (כולל מע"מ / ללא מע"מ)
  → Payment terms text

Step 4: Special Clauses
  → Free text field for additional terms

Step 5: Preview + Generate
  → Live preview of the Hebrew PDF layout
  → "Generate PDF" → saves to Supabase Storage
  → "Send via WhatsApp" → sends download link to client
  → "Save as Draft" → saves without PDF
```

**Agreement Detail** `/fees/[id]`:
- Embedded PDF preview (iframe from signed Storage URL)
- Status timeline: Draft → Sent → Signed
- Action buttons: Download PDF, Send via WhatsApp, Mark as Signed, Cancel
- Linked payment plan (if exists)

---

### Monthly Billing `/monthly`

**Overview page**:
- Month/year picker (defaults to current month)
- Grid: one row per active client
- Columns: client name, hours worked, hourly rate, fixed fee, expenses, total billed, invoice status, paid
- All fields inline-editable
- Row color: green (paid), yellow (invoiced not paid), red (not invoiced)
- "Export to Excel" button → downloads `.xlsx` file with the current month's data

**Per-client detail** `/monthly/[clientId]`:
- All months for this client in a timeline
- Total billed per month chart
- Outstanding balance calculation

---

### Payment Plans `/payments`

**List page**:
- Progress bar per plan: X of N installments paid
- Filter by status, overdue flag
- Sort by next due date

**Generator** `/payments/new`:

```
Step 1: Select Client + optionally link to case / fee agreement

Step 2: Spread Terms
  → Total amount (סכום כולל)
  → Down payment (מקדמה)
  → Number of installments (מספר תשלומים)
  → Frequency (monthly / biweekly / weekly)
  → Start date
  → Interest rate (optional)

Step 3: Preview Schedule
  → Auto-computed installment table:
     # | Due Date | Amount | Cumulative
  → Editable: individual amounts if unequal split needed

Step 4: Generate PDF → save plan + installments + PDF
```

**Plan Detail** `/payments/[id]`:
- Installment table with "Mark Paid" button per row
  - Opens modal: payment date, amount received, method, receipt number
- Summary: total, paid, remaining, next due date
- PDF download + send via WhatsApp button
- History: all payment events from `activity_log`

---

### Debt Flow `/debtflow`

**Dashboard page**:
- Summary cards: total original debt, total collected, remaining balance, count by status
- All debts table: creditor/debtor, original, balance, status, last transaction
- Filter by client, status

**Debt Detail** `/debtflow/[id]`:
- Header: creditor → debtor, original amount, current balance, interest rate, status
- Balance over time — Recharts line chart (x: date, y: balance in ILS)
- Ledger table: all transactions (date, type, amount, running balance, description)
- "Add Transaction" inline form:
  - Type: payment / interest / fee / adjustment / write-off
  - Date, amount, description
  - On save: updates `current_balance` + logs to `activity_log`

---

### WhatsApp `/whatsapp`

**Conversation List** `/whatsapp`:
- Sorted by `last_message_at` DESC
- Each item: client name (if matched), phone, last message preview, unread count badge, status badge
- Filter: open / bot / escalated / all
- "Switch to bot" / "Take over" toggle per conversation

**Chat View** `/whatsapp/[conversationId]`:
- Scrollable message list (inbound = right/blue, outbound = left/gray in RTL layout)
- Supabase Realtime subscription on `whatsapp_messages` — live updates without page refresh
- Send box: text input + send button + media upload
- Client panel on the side: linked client details, quick actions (open case, create fee agreement)
- Status controls: open / escalate / close / hand to bot

---

## 7. WhatsApp Integration — Full Detail

### Architecture

```
Client's Phone
     │ (WhatsApp)
     ▼
Meta WhatsApp Cloud API
     │ (webhook POST)
     ▼
Next.js /api/webhooks/whatsapp
     │
     ├─── Write message to Supabase (whatsapp_messages)
     ├─── Match phone → clients (whatsapp_conversations.client_id)
     │
     ├─── If conversation.status = 'bot'
     │         └──▶ POST to Python FastAPI /respond
     │                   └──▶ Write bot reply to Supabase
     │                   └──▶ Send reply via Meta API
     │
     └─── If status = 'open' or 'escalated'
               └──▶ Store only, staff replies manually from UI

Staff (Web UI)
     │ (click send)
     ▼
Next.js /api/whatsapp/send
     │
     ├─── POST to Meta API (send message)
     └─── Write to whatsapp_messages (direction: outbound, sender: staff)
```

### Webhook Handler — `/api/webhooks/whatsapp/route.ts`

```typescript
// Responsibilities:
// 1. GET: verify_token handshake (Meta requires this on setup)
// 2. POST:
//    a. Verify X-Hub-Signature-256 HMAC signature
//    b. Parse message payload (text, media, status updates)
//    c. Deduplicate by wa_message_id
//    d. Upsert whatsapp_conversations (create if new phone)
//    e. Match phone to clients table
//    f. Insert into whatsapp_messages
//    g. If conversation.status === 'bot': call Python agent
//    h. Always return 200 OK to Meta immediately (async processing)
```

### Python Agent — Refactored to FastAPI

```python
# lexoffice-agent/main.py
# Single endpoint. Receives context, returns reply string.
# POST /respond
# Body: { phone, message, client_name, open_cases: [...] }
# Response: { reply: string }
#
# Internal logic (kept from existing whatsapp-agent):
# - Intent detection (appointment, document request, payment query, general)
# - Template-based responses in Hebrew
# - No direct DB access — all data provided by Next.js in the request body
```

### Environment Variables

```bash
# Meta WhatsApp Cloud API
WA_PHONE_NUMBER_ID=          # From Meta Developer Console
WA_ACCESS_TOKEN=             # Permanent system user token
WA_WEBHOOK_VERIFY_TOKEN=     # Your custom string for webhook verification
WA_API_VERSION=v19.0

# Python Bot
PYTHON_AGENT_URL=https://lexoffice-agent.onrender.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # Webhook route only — never exposed to browser
```

---

## 8. Key Technical Decisions

### Hebrew PDF Generation

`@react-pdf/renderer` runs server-side inside a Next.js Route Handler (`/api/fees/[id]/generate-pdf`). Hebrew text requires:
1. Download Heebo font `.ttf` file
2. Register via `Font.register({ family: 'Heebo', src: '/fonts/Heebo-Regular.ttf' })`
3. Set `style={{ fontFamily: 'Heebo', direction: 'rtl', textAlign: 'right' }}` on document root
4. This is the single trickiest technical task — must be validated in Phase 3

### RTL Setup

```typescript
// app/layout.tsx
<html lang="he" dir="rtl">

// tailwind.config.ts
plugins: [require('tailwindcss-rtl')]
// Use ps-*, pe-*, ms-*, me-* instead of pl-*, pr-*, ml-*, mr-*
```

### Currency Handling

```typescript
// All DB values in agorot (integer)
// lib/formatting.ts
export const toAgorot = (ils: number) => Math.round(ils * 100)
export const fromAgorot = (agorot: number) => agorot / 100
export const formatILS = (agorot: number) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' })
    .format(agorot / 100)
```

### Server Actions vs Route Handlers

| Use Case | Approach |
|---|---|
| Create/update/delete records | Server Actions (colocated with pages) |
| Form submissions | Server Actions |
| PDF generation (binary response) | Route Handler |
| WhatsApp webhook (external POST) | Route Handler |
| WhatsApp send (from staff UI) | Route Handler |

### Supabase Client Pattern

```typescript
// Browser components (Realtime, client state)
import { createBrowserClient } from '@supabase/ssr'

// Server Components + Server Actions
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Webhook route (service role, bypasses RLS)
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, SERVICE_ROLE_KEY)
// Service role key NEVER in NEXT_PUBLIC_* env vars
```

### Dates

```typescript
// All display uses he-IL locale
new Intl.DateTimeFormat('he-IL', { timeZone: 'Asia/Jerusalem' }).format(date)

// DB stores first-of-month for monthly entries
// '2025-06-01' represents "June 2025"
```

---

## 9. Implementation Phases

### Phase 1: Foundation (Estimated: 1–2 days)
**Goal**: Skeleton running on Vercel, auth working, RTL confirmed.

- [ ] Init Next.js 14 project: `npx create-next-app@14 lexoffice --typescript --tailwind --app`
- [ ] Configure `tailwindcss-rtl` plugin
- [ ] Set `dir="rtl"` on root `<html>`, load Heebo via `next/font/google`
- [ ] Install `@supabase/ssr`, configure `middleware.ts` for session refresh
- [ ] Create Supabase project (or reuse existing)
- [ ] Wire up Supabase Auth: login page, logout action, middleware auth guard on `/(app)/*`
- [ ] Build `AppShell` with `Sidebar` + `TopBar` (static links, no data)
- [ ] Build placeholder page for each of the 7 modules
- [ ] Deploy to Vercel, confirm auth + RTL + Hebrew font in production

**Deliverable**: Login → sidebar → placeholder pages. RTL verified in browser.

---

### Phase 2: Clients Module (Estimated: 2–3 days)
**Goal**: Full replacement for `Low_Office_App`.

- [ ] Create Supabase tables: `clients`, `cases`
- [ ] RLS policies: authenticated users can CRUD
- [ ] Client list page with search (Supabase `ilike`)
- [ ] Client create/edit form + Server Action
- [ ] Archive client (soft delete via `archived_at`) + Server Action
- [ ] Client profile page with tab layout
- [ ] Cases CRUD within client profile
- [ ] `activity_log` writes on every create/update
- [ ] Empty states + loading skeletons

**Deliverable**: Create/search/edit/archive clients and cases.

---

### Phase 3: Fee Agreements + PDF (Estimated: 3–4 days)
**Goal**: Replace `Attornes_fees`. This phase has the highest technical risk (Hebrew PDF).

- [ ] Create Supabase table: `fee_agreements`, `documents`
- [ ] Supabase Storage bucket: `documents` (private)
- [ ] Multi-step agreement generator form
- [ ] Install `@react-pdf/renderer`, register Heebo font TTF
- [ ] Build Hebrew RTL PDF template for fee agreement
- [ ] Route Handler: `/api/fees/[id]/generate-pdf` → returns PDF binary
- [ ] Upload generated PDF to Supabase Storage, store path in `document_url`
- [ ] Serve PDF via signed URL (1-hour expiry)
- [ ] Agreement list page grouped by status
- [ ] Agreement detail page: PDF preview iframe + status actions
- [ ] "Send via WhatsApp" stub (copies signed URL to clipboard)

**Deliverable**: Generate + download Hebrew fee agreement PDFs.

---

### Phase 4: Payment Plans (Estimated: 2–3 days)
**Goal**: Replace `Payment_deploy`.

- [ ] Create Supabase tables: `payment_plans`, `payment_installments`
- [ ] Payment plan generator form with auto-computed schedule
- [ ] Preview installment table before saving
- [ ] Save plan + bulk-insert installment rows (Server Action)
- [ ] Plan detail page with installment tracker
- [ ] "Mark Paid" row action → updates installment + logs activity
- [ ] Auto-complete plan when all installments paid
- [ ] Hebrew PDF template for payment spread agreement
- [ ] Overdue installments badge on sidebar + dashboard card
- [ ] Filter plans by client in client profile tab

**Deliverable**: Full payment plan creation and tracking.

---

### Phase 5: Monthly Billing (Estimated: 1–2 days)
**Goal**: Replace `Attorneys-fees-Monthly`.

- [ ] Create Supabase table: `monthly_fee_entries`
- [ ] Month/year picker UI
- [ ] Inline-editable grid: hours, rate, fixed fee, expenses → computed total
- [ ] `upsertMonthlyEntry` Server Action (INSERT ... ON CONFLICT DO UPDATE)
- [ ] Invoice status tracking: not sent / sent / paid
- [ ] Excel export: `xlsx` package, one sheet per month
- [ ] Per-client monthly history page
- [ ] Monthly totals in client profile overview

**Deliverable**: Monthly billing grid with Excel export.

---

### Phase 6: Debt Flow (Estimated: 2–3 days)
**Goal**: Replace `debtflow`.

- [ ] Create Supabase tables: `debt_flows`, `debt_transactions`
- [ ] Postgres function/trigger to update `current_balance` on transaction insert
- [ ] Debt list with aggregated KPI cards (Supabase RPC or view)
- [ ] New debt form
- [ ] Debt detail: ledger table + Recharts balance chart
- [ ] Add transaction form (inline on detail page)
- [ ] Status transitions: active → partial → settled / written-off
- [ ] Debt summary in client profile tab

**Deliverable**: Full debt ledger with balance history chart.

---

### Phase 7: WhatsApp Integration (Estimated: 3–5 days)
**Goal**: Replace `whatsapp-agent`. Most complex phase due to external API.

- [ ] Create Supabase tables: `whatsapp_conversations`, `whatsapp_messages`
- [ ] Webhook handler: `POST /api/webhooks/whatsapp`
  - [ ] Signature verification
  - [ ] Message parsing + dedup
  - [ ] Client phone matching
  - [ ] Insert to Supabase
- [ ] Webhook GET: verification handshake for Meta
- [ ] Conversation list page
- [ ] Chat window with Supabase Realtime subscription
- [ ] Staff send message: `POST /api/whatsapp/send` → Meta API → Supabase
- [ ] "Hand to bot" / "Take over" conversation status toggle
- [ ] Python agent: refactor to FastAPI `/respond` endpoint
- [ ] Wire Next.js webhook → Python agent for bot-mode conversations
- [ ] WhatsApp history tab in client profile

**Deliverable**: Full WhatsApp inbox with live chat, bot integration, and client linking.

---

### Phase 8: Dashboard + Polish (Estimated: 2–3 days)
**Goal**: Production-ready, consistent, fully usable.

- [ ] Dashboard KPI cards with real Supabase queries
- [ ] Overdue installments alert table on dashboard
- [ ] Activity log feed (real data)
- [ ] Consistent loading skeletons across all pages
- [ ] Consistent empty states with call-to-action
- [ ] Error boundaries + friendly error messages in Hebrew
- [ ] Mobile sidebar: hamburger toggle, drawer-style
- [ ] Print stylesheets for documents (for cases where PDF isn't used)
- [ ] Settings page: user profile, WhatsApp bot on/off toggle
- [ ] Final RTL QA pass across all pages
- [ ] Performance: add Supabase indexes for all filter queries

**Deliverable**: Polished, production-ready unified app.

---

## 10. Migration Strategy

Data migration is decided per module (user's preference). Options per module:

| Module | Migration Options |
|---|---|
| Clients | Manual re-entry OR export CSV from Low_Office_App → import script |
| Fee Agreements | Keep old app read-only for archive; create new ones in LexOffice |
| Monthly Billing | Start from current month in LexOffice; keep old app for historical |
| Payment Plans | Migrate active plans only; historical stays in old app |
| Debt Flow | Export from debtflow → import script (opening balance per debt) |
| WhatsApp | History not migrated; conversations continue fresh in LexOffice |

---

## 11. Out of Scope (Not in This Plan)

- Multi-tenant / multi-office support
- Client-facing portal (clients can't log in — staff-only app)
- Mobile native app (PWA is fine, no React Native)
- Stripe or online payment integration
- Court calendar / hearing reminders (future phase)
- Document e-signing (DocuSign / HelloSign integration — future phase)

---

## 12. Open Questions (Decide Before Building)

1. **Supabase project**: Create a new project for LexOffice, or reuse an existing one?
2. **WhatsApp number**: Is there already an approved WhatsApp Business account with Meta, or does that need to be set up?
3. **App name**: Is "LexOffice" the right name, or do you have a preferred Hebrew/English name?
4. **Existing data**: Which modules need real data migration (not just "start fresh")? Clients? Active payment plans?
5. **Users**: How many staff members will use the app? (Affects RLS and whether we need roles/permissions beyond "authenticated = all access")
6. **Hosting**: Vercel (frontend) + new Supabase project is the assumption. Confirm before Phase 1.

---

*Plan version: 1.0 — 2026-06-18*
*Ready to implement on approval.*
