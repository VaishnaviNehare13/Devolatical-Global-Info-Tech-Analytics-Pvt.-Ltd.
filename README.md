# Devolatical Global Info-Tech & Analytics Pvt. Ltd.

> Enterprise Management System, Client Portal & Core Backend API

A robust, enterprise-grade backend platform engineered for **Devolatical Global Info-Tech & Analytics Pvt. Ltd.** The system provides a centralized RESTful API foundation supporting corporate operations, client lifecycle management, project and milestone tracking, lead conversion pipelines, support desk ticketing, task management, document asset storage, and granular audit logging.

---

## Project Overview

This backend platform delivers a scalable, modular foundation designed around enterprise best practices, strict layer decoupling, comprehensive type safety, and role-based access control.

### Key Capabilities

- **Secure Authentication & RBAC**: JWT-based authentication with token rotation, permission management, and system role guards.
- **Client & Project Management**: Organization accounts, multi-tier project tracking, and milestone-level deliverables.
- **Task & Ticketing Pipelines**: Comprehensive task scheduling, time tracking, priority assignments, and support desk tickets.
- **Lead Pipeline**: Lead stage progression, tracking, and qualification activities.
- **Document Management**: Secure multipart file uploads via Multer with metadata mapping, MIME type validation, and soft-delete lifecycles.
- **Enterprise Audit Logging**: Structured audit recording across all domain mutations for regulatory compliance and accountability.

---

## Backend Implementation Status

The backend core architecture is fully implemented, wired, buildable, and registered in the versioned API router.

| Component | Status | Details |
|---|:---:|---|
| **Database & Schema** | ✅ Complete | 13 models, indexes, relational constraints, and soft-delete columns |
| **Data Transfer Objects (DTOs)** | ✅ Complete | Strict Zod validation schemas for request bodies, params, and queries |
| **Repository Layer** | ✅ Complete | Decoupled Prisma repositories with select projections and error mapping |
| **Mapper Layer** | ✅ Complete | Pure presentation mappers stripping internal database audit fields |
| **Service Layer** | ✅ Complete | Domain business logic, relational integrity checks, and audit logging |
| **Controller Layer** | ✅ Complete | Thin HTTP controllers with domain-to-HTTP error translation |
| **Routes & Security** | ✅ Complete | Versioned express routers with JWT auth, RBAC, and rate limiting |
| **Module Bootstrapping** | ✅ Complete | Dependency injection factories sharing a singleton PrismaClient |
| **API Registration** | ✅ Complete | All 13 modules mounted under versioned `/api/v1/*` routes |
| **Integration Testing** | ✅ 66/66 Passing | Automated integration suites covering RBAC, Audit Logs, and Documents |

---

## Backend Modules

All 13 backend modules follow a uniform 8-layer modular architecture:

| Module | Purpose | Status |
|---|---|:---:|
| **Auth** | User login, registration, token refresh, password reset, and session verification | **Complete** |
| **Users** | User profile management, status management, and system user directory | **Complete** |
| **Roles** | System and custom role definitions with permission assignments | **Complete** |
| **Permissions** | Granular feature and resource permission definitions | **Complete** |
| **Role-Permissions** | Relational mapping between roles and permission matrices | **Complete** |
| **Audit Logs** | Immutable system-wide audit trail capturing actions, severity, and actor metadata | **Complete** |
| **Clients** | Client company directory, contact records, and relationship tracking | **Complete** |
| **Projects** | Project lifecycles, budgets, deadlines, and client associations | **Complete** |
| **Milestones** | Project phase tracking, deliverables, and progress states | **Complete** |
| **Leads** | Sales pipeline tracking, lead stages, and qualification activities | **Complete** |
| **Tickets** | Customer support desk, ticket prioritization, statuses, and resolution | **Complete** |
| **Tasks** | Granular work items, estimated/logged hours, assignees, and parent/subtask trees | **Complete** |
| **Documents** | Multipart file upload management, MIME whitelisting, metadata, and entity linking | **Complete** |

---

## Architecture & Design Patterns

The backend follows a strict 8-layer decoupled architecture:

```text
HTTP Request
    │
    ▼
Routes & Middleware  ──▶ [Auth Middleware + RBAC Guard + Multer + Zod Validation]
    │
    ▼
Controller           ──▶ [Extracts payload/params, calls Service, invokes Mapper]
    │
    ▼
Service Layer        ──▶ [Business rules, entity integrity, audit logging via IAuditLogService]
    │
    ▼
Repository Layer     ──▶ [Prisma queries, select projections, dynamic filters, soft-delete]
    │
    ▼
Database             ──▶ [PostgreSQL via Prisma ORM]
```

### Presentation Safety & Data Masking

Domain outputs are strictly sanitized through static `Mapper` classes before returning API responses:
- Internal database tracking fields (`createdById`, `updatedById`, `deletedAt`) are stripped from public responses.
- `Date` objects are serialized to standard ISO 8601 strings.
- Prisma `Decimal` values are cast to JavaScript `number` types.

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
| `/api/v1/projects` | Project management endpoints | Authenticated + Admin |
| `/api/v1/projects/:projectId/milestones` | Project milestone deliverables | Authenticated + Admin |
| `/api/v1/leads` | Lead pipeline and conversion tracking | Authenticated + Admin |
| `/api/v1/tickets` | Support desk ticketing system | Authenticated + Admin |
| `/api/v1/tasks` | Task allocation, time logs, and hierarchy | Authenticated + Admin |
| `/api/v1/documents` | Document upload, metadata, and lifecycle | Authenticated + Admin |

---

## Documents Module & File Storage

The Documents module provides secure asset management integrated into business entities:

- **Multipart Upload**: Handled via Multer `diskStorage` writing to isolated `uploads/documents/`.
- **Upload Limit**: 25 MB per document (`DOCUMENT_VALIDATION.MAX_FILE_SIZE`).
- **MIME Whitelist**: Restricts uploads to standard business formats (PDF, Word, Excel, PowerPoint, Plain Text, CSV, JPEG, PNG, WebP, ZIP).
- **Collision & Traversal Protection**: Uploaded files are saved with randomized unique identifiers (`doc-<timestamp>-<randomBytes>.<ext>`) rather than raw client filenames.
- **Relational Integrity**: Documents can be linked optionally to a `Client`, `Project`, and `Milestone` (with cross-project alignment validation).
- **Lifecycle Management**: Supports soft-deletion (`DELETE /:id`) and restoration (`POST /:id/restore`).
- **Storage Note**: Document binary file streaming/download is planned as a future storage adapter extension; current endpoints manage metadata persistence, validation, and retrieval.

---

## Technology Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript (strict mode)
- **Database & ORM**: PostgreSQL, Prisma ORM (v5.22.0)
- **File Uploads**: Multer
- **Validation**: Zod
- **Testing**: Jest, Supertest

### Security & Middleware
- **Authentication**: JWT (JSON Web Tokens) with HS256 / RS256 support
- **Authorization**: Role-Based Access Control (RBAC)
- **Headers & Rate Limiting**: Helmet, Express Rate Limit
- **Data Protection**: Deep-freeze sanitization, parameterized SQL via Prisma

---

## Quality & Verification

The backend passes all static verification checks, compilation, and automated test suites:

- **Prisma Schema**: Validated and formatted (`npx prisma validate`, `npx prisma format --check`) ✅
- **TypeScript**: Strict compile check passing with 0 errors (`npx tsc --noEmit`) ✅
- **ESLint**: Linter passing (`npm run lint`) ✅
- **Prettier**: Code style verified across all files (`npx prettier --check`) ✅
- **Production Build**: Clean compilation to `dist/` (`npm run build`) ✅
- **Automated Tests**: **66 / 66 tests passing** across 3 integration test suites ✅
  - `Role-Permission Mapping Integration Tests`: 18 tests passing
  - `Audit Logs Integration Tests`: 24 tests passing
  - `Documents Module Integration Tests`: 24 tests passing

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

6. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## Known & Future Improvements

- **Binary Download Streaming**: Adding a dedicated streaming download endpoint (`GET /api/v1/documents/:id/download`) and cloud storage adapters (e.g. AWS S3 / GCS).
- **Test Coverage Expansion**: Extending automated integration test suites to remaining earlier domain modules (`Tasks`, `Tickets`, `Leads`, `Projects`, `Milestones`, `Clients`).
- **Frontend Integration**: Connecting the React/Vite client portal and admin dashboard to the `/api/v1/*` backend APIs.

---

## License

This repository is maintained for the development of the **Devolatical Global Info-Tech & Analytics Pvt. Ltd.** platform.
