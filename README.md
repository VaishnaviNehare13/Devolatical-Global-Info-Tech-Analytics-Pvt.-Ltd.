# Devolatical Global Info-Tech & Analytics Pvt. Ltd.

> Enterprise Management System, Client Portal & Core Backend API

A robust, enterprise-grade platform engineered for **Devolatical Global Info-Tech & Analytics Pvt. Ltd.** The system provides a centralized RESTful API foundation and modern React single-page application supporting corporate operations, client lifecycle management, project and milestone tracking, lead conversion pipelines, support desk ticketing, task management, document asset storage, recruitment management, client portal tenant isolation, and granular audit logging.

---

## Project Overview

This platform delivers a scalable, modular foundation designed around enterprise best practices, strict layer decoupling, comprehensive type safety, absolute tenant security, and role-based access control (RBAC).

### Key Capabilities

- **Secure Authentication & RBAC**: JWT-based authentication with token rotation, session tracking, permission management, and system role guards (`SUPER_ADMIN`, `ADMIN`, `EMPLOYEE`, `CLIENT`).
- **Client & Project Management**: Organization accounts, multi-tier project tracking, and milestone-level deliverables.
- **Client Portal Tenant Isolation**: Absolute tenant isolation ensuring CLIENT users access only their linked organization's projects, invoices, and support desk tickets.
- **Invoices & Financial Management**: Invoice status tracking (`DRAFT`, `PENDING`, `PAID`, `OVERDUE`, `CANCELLED`) with strict tenant isolation.
- **Task & Ticketing Pipelines**: Comprehensive task scheduling, time tracking, priority assignments, and support desk tickets.
- **Lead Pipeline**: Lead stage progression, website inquiry submissions, tracking, qualification activities, and administrative lead directory.
- **Recruitment & Careers Portal**: Public job postings, application submissions, resume file uploads (Multer disk storage with MIME/size validation), and administrative candidate review queue.
- **System Telemetry & Metrics**: Real-time database counts, process uptime, memory usage, and database health metrics.
- **Document Management**: Secure multipart file uploads via Multer with metadata mapping, MIME type validation, and soft-delete lifecycles.
- **Enterprise Audit Logging**: Structured audit recording across all domain mutations for regulatory compliance and accountability.

---

## System Implementation Status

The core architecture is fully implemented, wired, buildable, and registered in the versioned API router.

| Component | Status | Details |
|---|:---:|---|
| **Database & Schema** | ✅ Complete | 15 models, 13 migrations up to date, indexes, relational constraints, and soft-delete columns |
| **Data Transfer Objects (DTOs)** | ✅ Complete | Strict Zod validation schemas for request bodies, params, and queries |
| **Repository Layer** | ✅ Complete | Decoupled Prisma repositories with select projections and error mapping |
| **Mapper Layer** | ✅ Complete | Pure presentation mappers stripping internal database audit fields |
| **Service Layer** | ✅ Complete | Domain business logic, relational integrity checks, tenant isolation, and audit logging |
| **Controller Layer** | ✅ Complete | Thin HTTP controllers with domain-to-HTTP error translation |
| **Routes & Security** | ✅ Complete | Versioned express routers with JWT auth, RBAC, tenant guards, and rate limiting |
| **Module Bootstrapping** | ✅ Complete | Dependency injection factories sharing a singleton PrismaClient |
| **API Registration** | ✅ Complete | All modules mounted under versioned `/api/v1/*` routes |
| **Integration Testing** | ✅ 100/100 Passing | Automated integration suites covering Auth, User Admin, RBAC, Client Portal, Leads, System Metrics, Careers, and Documents |

---

## Backend Modules

All backend modules follow a uniform 8-layer modular architecture:

| Module | Purpose | Status |
|---|---|:---:|
| **Auth** | User login, registration, token refresh, password reset, and session verification | **Complete** |
| **Users** | User profile management, status management, and system user directory | **Complete** |
| **Roles** | System and custom role definitions with permission assignments | **Complete** |
| **Permissions** | Granular feature and resource permission definitions | **Complete** |
| **Role-Permissions** | Relational mapping between roles and permission matrices | **Complete** |
| **Audit Logs** | Immutable system-wide audit trail capturing actions, severity, and actor metadata | **Complete** |
| **Clients** | Client company directory, contact records, and relationship tracking | **Complete** |
| **Client Portal** | Tenant-isolated endpoints for client overview, projects, invoices, and support desk | **Complete** |
| **Projects** | Project lifecycles, budgets, deadlines, and client associations | **Complete** |
| **Milestones** | Project phase tracking, deliverables, and progress states | **Complete** |
| **Invoices** | Financial invoice lifecycle, payment status, and client linking | **Complete** |
| **Leads** | Sales pipeline tracking, public contact submissions, and lead lifecycle | **Complete** |
| **Careers** | Job posting management, applicant tracking, and resume file upload engine | **Complete** |
| **System Metrics** | Real-time telemetry, memory usage, process uptime, and database health metrics | **Complete** |
| **Tickets** | Customer support desk, ticket prioritization, statuses, and resolution | **Complete** |
| **Tasks** | Granular work items, estimated/logged hours, assignees, and parent/subtask trees | **Complete** |
| **Documents** | Multipart file upload management, MIME whitelisting, metadata, and entity linking | **Complete** |

---

## Versioned API Routes (`/api/v1`)

All endpoints are registered under `/api/v1` in `backend/src/routes/v1/index.ts`:

| Route Prefix | Description | Auth / RBAC Guard |
|---|---|:---:|
| `GET /api/v1/health` | Service health check and uptime | Public |
| `/api/v1/auth` | Authentication and session endpoints | Public / Token Auth |
| `/api/v1/users` | User management endpoints | Authenticated + Admin |
| `/api/v1/roles` | Role definitions and access controls | Authenticated + Admin |
| `/api/v1/roles/:roleId/permissions` | Role-permission assignment matrix | Authenticated + Admin |
| `/api/v1/permissions` | System permission catalog | Authenticated + Admin |
| `/api/v1/audit-logs` | Queryable audit trail with filtering and search | Authenticated + Admin |
| `/api/v1/clients` | Client directory and profile endpoints | Authenticated + Admin |
| `/api/v1/client-portal` | Tenant-isolated client overview, projects, invoices, tickets | Authenticated + Client |
| `/api/v1/projects` | Project management endpoints | Authenticated + Staff / Admin |
| `/api/v1/invoices` | Invoice creation and administration | Authenticated + Admin |
| `/api/v1/leads` | Lead pipeline submission and management | Public Submit / Admin Mgmt |
| `/api/v1/careers` | Job postings, job applications, resume file download | Public Jobs/Apply / Admin Mgmt |
| `/api/v1/system/metrics` | Real-time system telemetry and database health | Authenticated + Admin |
| `/api/v1/tickets` | Support desk ticketing system | Authenticated + Staff / Admin |
| `/api/v1/tasks` | Task allocation, time logs, and hierarchy | Authenticated + Staff / Admin |
| `/api/v1/documents` | Document upload, metadata, and lifecycle | Authenticated + Staff / Admin |

---

## Technology Stack

### Frontend
- **Framework**: React 19, React Router DOM 7
- **Bundler**: Vite 8
- **Styling**: TailwindCSS 4, Framer Motion, Lucide React
- **Linter**: Oxlint

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript (strict mode)
- **Database & ORM**: PostgreSQL, Prisma ORM (v5.10.2)
- **File Uploads**: Multer
- **Validation**: Zod
- **Testing**: Jest, Supertest

---

## Quality & Verification

The project passes all static verification checks, compilation, and automated test suites:

- **Prisma Schema**: Validated (`npx prisma validate`) ✅
- **Prisma Migrations**: Schema up to date (`13 migrations found in prisma/migrations`) ✅
- **Frontend Build**: Clean compilation (`npm run build` -> `✓ built in 984ms`) ✅
- **Backend Build**: Clean TypeScript compilation (`npm run build` -> `tsc` exit code 0) ✅
- **Linter**: Passed with 0 errors (`npx oxlint`) ✅
- **Automated Integration Tests**: **100 / 100 tests passing** across 8 integration test suites ✅
  - `Authentication & Session Integration Tests`: 13 tests passing
  - `User Admin Management Integration Tests`: 7 tests passing
  - `Role-Permission Mapping Integration Tests`: 18 tests passing
  - `Client Portal Tenant Isolation Integration Tests`: 17 tests passing
  - `Public Lead Submission Integration Test`: 2 tests passing
  - `Admin Lead Management Integration Tests`: 7 tests passing
  - `System Metrics Telemetry Integration Tests`: 5 tests passing
  - `Careers & Recruitment Integration Tests`: 11 tests passing

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/VaishnaviNehare13/Devolatical-Global-Info-Tech-Analytics-Pvt.-Ltd..git
   cd SIP/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and configure database and secret credentials:
   ```bash
   cp .env.example .env
   ```

4. **Initialize Database**:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run Verification & Tests**:
   ```bash
   npm run test
   ```

6. **Start Development Servers**:
   - Backend: `npm run dev` (in `/backend`)
   - Frontend: `npm run dev` (in `/`)

---

## License

This repository is maintained for the development of the **Devolatical Global Info-Tech & Analytics Pvt. Ltd.** platform.
