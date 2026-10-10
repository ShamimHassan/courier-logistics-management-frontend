# 🚚 CourierFlow Frontend — Courier & Logistics Management Platform

## 📌 Project Overview

A Next.js 16 App Router frontend for Bangladesh's courier & logistics operations, built to work with a backend API for shipment management, real-time tracking, SSLCommerz payment integration, courier assignment workflows, and 3-role dashboards (Customer, Courier, Admin).

This project is the client application for a role-based logistics workflow where Customers book and pay for shipments, Couriers manage pickups and deliveries, and Admins oversee the full operation with KPI charts, audit logs, hub management, and pricing rules.

**📦 Frontend Repo:** `https://github.com/ShamimHassan/courier-logistics-management-frontend`  
**🔧 Backend Repo:** `https://github.com/ShamimHassan/courier-logistics-management-backend`  
**🌐 Live Frontend:** `https://courier-logistics-management-fronte.vercel.app`  
**🌐 Live API:** `https://courier-logistics-management-backend.vercel.app/api/v1`  

---

## 👥 Roles & Permissions

| Role | Key Capabilities |
|------|-----------------|
| **ADMIN** | Full access — manage users, hubs, pricing rules, assign couriers, view all shipments org-wide, view audit logs, dashboard KPIs, process refunds |
| **COURIER** | Self-only access — own assignments, accept/reject jobs, log pickups, hub scans, delivery attempts (DELIVERED/FAILED), earnings report, profile & availability toggle |
| **CUSTOMER** | Self-only access — book shipments, pay via SSLCommerz, track parcels, view shipment timeline, rate delivered shipments, profile management, notifications |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.3.8 (App Router) |
| Language | TypeScript (strict) |
| UI | React 19 + Tailwind CSS v4 |
| Component Library | shadcn/ui |
| Data Fetching | TanStack Query v5 |
| State Management | Zustand v5 |
| Forms | React Hook Form + Zod |
| HTTP Client | Custom `apiFetch` (native fetch + interceptors) |
| Charts | Recharts 2.13 |
| Icons | Lucide React |
| Notifications | Sonner |
| Fonts | Inter (next/font/google) |
| Payments | SSLCommerz (Test/Sandbox Mode) |
| Deployment | Vercel |

---

## ✨ Features

- Public landing page with hero section, service highlights, testimonials, FAQ accordion, pricing quote CTA, and responsive Navbar + Footer
- JWT-based authentication with login, session persistence via Zustand + localStorage, automatic token refresh on 401, and One-Click Demo Login for all 3 roles
- Role-specific dashboard shells (Customer, Courier, Admin) with sidebar navigation, mobile Sheet drawer, user avatar dropdown, and notifications bell
- Middleware-based route protection with HMAC-signed cookies for RBAC enforcement
- Customer: shipment booking wizard (4 steps), live quote calculator, real-time tracking timeline with status icons, payment via SSLCommerz, shipment cancellation, 1–5 star rating on delivered shipments
- Courier: assignment list with Offered/Accepted/In Progress/Completed tabs, accept/reject with reason dialog, full delivery workflow (pickup condition → hub scan → transit → out for delivery → delivery attempt)
- Discriminated delivery attempt form: DELIVERED (recipient name, photo proof URL, OTP, signature) or FAILED (reason enum + notes)
- Admin: KPI overview dashboard with Recharts LineChart/BarChart/PieChart, shipments table with assign-courier modal and admin status override, user management with status toggle and role change, hub CRUD, pricing rules CRUD, audit logs viewer with JSON diff expansion, payment refund dialog
- Courier earnings report with date-range filter, 5 summary cards, Recharts LineChart trend, paginated delivery table, and CSV export
- Notifications inbox with All/Unread/Read tabs, per-item read toggle, mark-all-as-read, and pagination
- Profile management: edit name/phone/avatar URL, change password with 4-rule strength indicator, courier availability toggle
- Payment success and cancel pages for SSLCommerz redirect handling
- Responsive design: mobile-first, hamburger sidebar drawer on mobile, horizontal scroll on tables, 44px touch targets, skip-to-content accessibility link

---

## 📡 API Endpoints Used

**Base URL:** `https://courier-logistics-management-backend.vercel.app/api/v1`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login, returns JWT access + refresh tokens |
| POST | `/auth/register` | Register new CUSTOMER account |
| POST | `/auth/refresh-token` | Rotate refresh token |
| POST | `/auth/logout` | Logout (revokes refresh token) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get current user profile |
| PATCH | `/users/me` | Update name, phone, profile image URL |
| PATCH | `/users/me/password` | Change password |

### Shipments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/shipments/quote` | Calculate shipping quote |
| GET | `/shipments/my` | Customer's own shipments |
| POST | `/shipments` | Create shipment |
| GET | `/shipments/:id` | Get shipment detail |
| GET | `/shipments/:id/tracking` | Tracking timeline events |
| POST | `/shipments/:id/pickup` | Courier marks pickup with condition |
| PATCH | `/shipments/:id/status` | Courier/Admin status transition |
| POST | `/shipments/:id/delivery-attempts` | Record DELIVERED or FAILED attempt |
| POST | `/shipments/:id/cancel` | Cancel shipment |
| POST | `/shipments/:id/rating` | Customer rates delivered shipment |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/shipments/:id/checkout` | Initiate SSLCommerz checkout |
| GET | `/payments/shipments/:id` | Get payment by shipment |
| POST | `/payments/:id/refund` | Admin: process refund |

### Couriers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/couriers/me` | Courier profile + service zones |
| GET | `/couriers/me/earnings` | Paginated earnings with date filter |
| PATCH | `/couriers/me/availability` | Toggle available/unavailable |

### Assignments
| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/assignments/:id/accept` | Accept assignment |
| PATCH | `/assignments/:id/reject` | Reject with reason enum + notes |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List with read/unread filter + pagination |
| PATCH | `/notifications/:id/read` | Mark single notification as read |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard-stats` | KPI aggregate stats |
| GET | `/admin/users` | List users with filters |
| PATCH | `/admin/users/:id/status` | Activate / suspend user |
| PATCH | `/admin/users/:id/role` | Change user role (with reason) |
| POST | `/admin/shipments/:id/assign` | Assign courier to shipment |
| GET | `/admin/assignments/unassigned` | Unassigned shipments queue |
| GET | `/admin/audit-logs` | Audit log entries with filters |
| POST | `/admin/pricing-rules` | Create pricing rule |
| PATCH | `/admin/pricing-rules/:id` | Update pricing rule |
| GET `/POST /PATCH` | `/hubs` | Hub CRUD |

---

## 🗂️ Project Structure

```
courier-logistics-management-frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx                          # Public landing page
│   │   ├── layout.tsx                        # Root layout with providers, skip-nav, Toaster
│   │   ├── globals.css                       # Tailwind v4, design tokens, print styles
│   │   ├── error.tsx                         # Global error boundary
│   │   ├── not-found.tsx                     # 404 page
│   │   ├── providers.tsx                     # TanStack QueryClient + ReactQueryDevtools
│   │   ├── about/page.tsx
│   │   ├── services/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── pricing/page.tsx                  # Live quote calculator
│   │   ├── login/page.tsx                    # Login + One-Click Demo buttons
│   │   ├── register/page.tsx                 # Customer registration
│   │   ├── payment/
│   │   │   ├── success/page.tsx              # SSLCommerz success redirect handler
│   │   │   └── cancel/page.tsx               # SSLCommerz cancel redirect handler
│   │   ├── (dashboard)/                      # Customer route group
│   │   │   ├── layout.tsx
│   │   │   └── dashboard/
│   │   │       ├── page.tsx                  # Customer overview KPIs + recent shipments
│   │   │       ├── shipments/page.tsx        # Shipments table (URL-state filters + pagination)
│   │   │       ├── shipments/new/page.tsx    # 4-step shipment wizard
│   │   │       ├── shipments/[id]/page.tsx   # Shipment detail + tracking timeline + actions
│   │   │       ├── notifications/page.tsx    # Notifications inbox
│   │   │       └── profile/page.tsx          # Edit profile + change password
│   │   ├── (courier)/                        # Courier route group
│   │   │   ├── layout.tsx
│   │   │   └── courier/
│   │   │       ├── page.tsx                  # Courier overview + availability + weekly chart
│   │   │       ├── assignments/page.tsx      # Assignments table with tabs + accept/reject
│   │   │       ├── assignments/[id]/page.tsx # Assignment detail + pickup/hub/status actions
│   │   │       ├── assignments/[id]/deliver/ # Delivery attempt form (DELIVERED/FAILED)
│   │   │       ├── earnings/page.tsx         # Earnings report + Recharts LineChart
│   │   │       ├── notifications/page.tsx
│   │   │       └── profile/page.tsx          # Vehicle info + zones table + availability
│   │   └── (admin)/                          # Admin route group
│   │       ├── layout.tsx
│   │       └── admin/
│   │           ├── page.tsx                  # Admin KPI dashboard + 4 Recharts charts
│   │           ├── shipments/page.tsx        # All shipments + assign courier + override
│   │           ├── users/page.tsx            # User management + status/role dialogs
│   │           ├── hubs/page.tsx             # Hub CRUD + inline active toggle
│   │           ├── pricing-rules/page.tsx    # Pricing rules CRUD
│   │           ├── audit-logs/page.tsx       # Audit log viewer + JSON diff expansion
│   │           └── settings/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx                    # Public nav with mobile Sheet + auth dropdown
│   │   │   ├── Footer.tsx
│   │   │   ├── DashboardShell.tsx            # Base sidebar + mobile drawer shell
│   │   │   ├── RoleDashboardShell.tsx        # Role-aware shell with nav items + user menu
│   │   │   └── SidebarNav.tsx                # Active-state sidebar links with badges
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx                  # Reusable KPI card (9 accent colours)
│   │   │   ├── RecentShipments.tsx           # Table with search/filter/skeleton/empty state
│   │   │   ├── ShipmentStatusBadge.tsx       # 16-status coloured badge with dot
│   │   │   └── customerKpis.ts              # computeCustomerKpis() + greetingForUser()
│   │   ├── shipments/
│   │   │   └── QuickShipWizard.tsx           # 4-step wizard (Zustand state)
│   │   ├── admin/
│   │   │   └── RefundDialog.tsx              # Reusable refund dialog
│   │   └── ui/                               # Full shadcn/ui component set
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts                     # apiFetch() with auto token refresh + auth adapter
│   │   │   ├── endpoints.ts                  # All typed API call functions
│   │   │   └── types.ts                      # All interfaces/types
│   │   ├── hooks/
│   │   │   ├── useApiQuery.ts                # TanStack useQuery wrapper
│   │   │   └── useApiMutation.ts             # useMutation with auto toast
│   │   ├── validations/
│   │   │   ├── auth.ts                       # loginSchema, registerSchema, demoLoginSchema
│   │   │   ├── user.ts                       # updateProfileSchema, changePasswordSchema
│   │   │   └── shipment.ts                   # shipment Zod schemas
│   │   ├── config/env.ts                     # Typed env vars
│   │   └── cookies.ts                        # HMAC-signed auth cookies
│   ├── store/
│   │   ├── useAuthStore.ts                   # Zustand persist (login, logout, demoLogin, hasRole)
│   │   └── useShipmentWizardStore.ts         # 4-step wizard state
│   └── middleware.ts                         # Route protection + role redirects
├── next.config.ts
├── package.json
└── README.md
```

---

## 🏗️ Frontend Architecture

```text
Next.js 16 App Router
  ├─ Public pages (landing, about, services, pricing, contact)
  ├─ Auth pages (login, register)
  ├─ Payment redirect pages (success, cancel)
  ├─ Protected dashboard shells (Customer / Courier / Admin)
  ├─ Role-based feature pages
  ├─ Shared UI components and tables
  └─ API client + auth/session state
          │
          ▼
    CourierFlow Backend API
    (JWT-protected Express + Prisma)
```

### Authentication Flow

1. Login form sends credentials to `POST /auth/login` via `apiFetch`.
2. Backend returns `user` + `accessToken` + `refreshToken`.
3. Zustand `useAuthStore` (persisted to localStorage) stores tokens.
4. HMAC-signed cookies (`cf_r`, `cf_u`, `cf_s`) are set for Next.js middleware.
5. `middleware.ts` reads the signed cookie to enforce role-based route protection.
6. `AuthAdapterRegistrar` wires Zustand tokens into the shared `apiFetch` client.
7. On 401, `apiFetch` auto-calls `POST /auth/refresh-token` once, retries the request, and redirects to `/login` on 2nd failure.

### State and Data Handling

- `Zustand` stores auth state (user, tokens, isHydrated) and shipment wizard state.
- `TanStack Query v5` handles all async data with `staleTime: 60s`, smart retry (skip 4xx), and global error toasts via `QueryCache`.
- `React Hook Form + Zod` validates all forms — schemas mirror backend validation exactly.
- URL state (`useSearchParams`) syncs filters, sort, search, and pagination for all list pages.

---

## 🔑 Key Design Decisions

### 1. Typed API client with auto-refresh
`apiFetch()` in `lib/api/client.ts` handles token attachment, `Content-Type`, `X-Request-ID` tracing, 401 intercept → single-flight refresh dedup, and logout + redirect on exhaustion.

### 2. Middleware RBAC via HMAC cookies
Since Zustand persists to localStorage (inaccessible to Edge middleware), auth cookies are signed with `AUTH_COOKIE_SECRET`. Middleware verifies these to enforce:  
- `/dashboard/*` → CUSTOMER only  
- `/courier/*` → COURIER only  
- `/admin/*` → ADMIN only

### 3. Discriminated delivery attempt form
The delivery form uses a Zod discriminated union matching the backend `deliveryAttemptSchema` exactly — `"DELIVERED"` branch requires `recipientName` + `photoProofUrl`; `"FAILED"` branch requires `reason` enum + `notes`.

### 4. One-Click Demo Login
Three styled demo cards on the login page use RHF's `setValue` + `handleSubmit` to auto-fill and submit real credentials, giving evaluators instant role-specific access.

### 5. Recharts for all charts
Admin dashboard: LineChart (shipments trend), BarChart (revenue by month), PieChart (status distribution). Courier earnings: LineChart with dual lines (earnings + delivery count). CSS-only bar charts for lightweight weekly delivery views.

---

## ✅ Requirements Checklist

| Requirement | Status | Details |
|-------------|--------|---------|
| **Next.js App Router** | ✅ | Server/Client split, layout.tsx, loading.tsx, error.tsx, not-found.tsx |
| **Modern UI/UX & Responsiveness** | ✅ | Tailwind v4 + shadcn/ui, mobile-first, 44px touch targets |
| **Authentication & Authorization** | ✅ | JWT + Zustand + HMAC cookie middleware, 3 roles |
| **One-Click Demo Login** | ✅ | All 3 roles (Admin, Courier, Customer) on login page |
| **API Integration & State** | ✅ | TanStack Query v5, Zustand, skeletons, error boundaries |
| **Form Handling & Validation** | ✅ | React Hook Form + Zod (matches backend schemas 1:1) |
| **Payment Integration** | ✅ | SSLCommerz Test Mode: checkout → redirect → success/cancel pages |
| **Meaningful Commits** | ✅ | 30 conventional commits (feat/chore/docs) |
| **Demo Credentials** | ✅ | All 3 roles with one-click login |
| **Deployment** | ✅ | Vercel production deployment |
| **18+ Pages** | ✅ | 22 pages across public/auth/customer/courier/admin |

---

## 🚀 Quick Setup

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

> Note: `--legacy-peer-deps` is required for Recharts 2.x with React 19.

### 2. Create environment file

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://courier-logistics-management-backend.vercel.app/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_COOKIE_SECRET=your-long-random-secret-min-32-chars
```

### 3. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Production build

```bash
npm run build
npm start
```

---

## 🌐 Deployment (Vercel)

The project is deployed on Vercel with the following environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://courier-logistics-management-backend.vercel.app/api/v1` |
| `NEXT_PUBLIC_APP_URL` | `https://courier-logistics-management-fronte.vercel.app` |
| `AUTH_COOKIE_SECRET` | *(secret — set in Vercel dashboard)* |

---

## 📜 Scripts

```bash
npm run dev      # Start Next.js development server
npm run build    # Build production bundle
npm run start    # Run production build locally
npm run lint     # Run ESLint checks
```
---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
