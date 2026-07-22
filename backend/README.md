# Devolatical Global Infotech & Analytics - Backend API Portal

This is the backend API service and client portal database system for **Devolatical Global Infotech & Analytics Pvt. Ltd.** The codebase is structured using Clean Architecture and SOLID principles, ensuring separation of concerns, high scalability, and robust security for production.

---

## Technical Stack
- **Runtime Environment:** Node.js (v18+)
- **Application Framework:** Express.js
- **Programming Language:** TypeScript
- **Database ORM:** Prisma ORM
- **Database Engine:** PostgreSQL (Development placeholder in `.env`)
- **Authentication Protocol:** JSON Web Tokens (JWT) & bcrypt hashing
- **Schema Validation:** Zod
- **API Request Security:** Helmet, CORS, and Express Rate Limiter
- **Logging Interface:** Morgan

---

## Folder Structure
The source folder follows a hybrid layered/modular structure to balance simple configurations with scalable modularity.

```text
backend/
├── prisma/
│   └── schema.prisma         # Prisma connection schema and models configuration
├── src/
│   ├── config/               # System and third-party configuration files
│   │   ├── env.ts            # Environment variables loader & validator using Zod
│   │   ├── db.ts             # Prisma Client database singleton and connector
│   │   └── cors.ts           # CORS Policy options config
│   ├── middleware/           # Express request-pipeline middlewares
│   │   ├── rateLimiter.ts    # DDoS and API limiting config
│   │   ├── notFoundHandler.ts# 404 Route Missing handler
│   │   └── errorHandler.ts   # Centralized express error handler
│   ├── modules/              # Feature modules folder (e.g. auth, portal, projects)
│   ├── utils/                # General utility classes & helper functions
│   │   ├── apiResponse.ts    # Standard API success/error JSON response helper
│   │   ├── appError.ts       # Operational and Programming custom Error class
│   │   └── logger.ts         # Console-logger wrapper for local server events
│   ├── app.ts                # Express application configuration and pipeline setup
│   └── server.ts             # HTTP Server entrypoint (Port binding & process-crashes hooks)
├── .env                      # Local environment configurations (private)
├── .env.example              # Template config file for sharing
├── .gitignore                # Target files to exclude from git control
├── package.json              # App dependencies, engines, and npm runner scripts
├── tsconfig.json             # TypeScript Compiler configurations
└── README.md                 # Project technical documentation
```

---

## Folder & File Rationale

### 1. Root Directories & Configs
* **`prisma/`**: Houses database schemas, migration files, and database seed scripts. Decouples raw database setups from node code.
* **`package.json`**: Controls third-party libraries, Node version constraints, and aliases for scripts.
* **`tsconfig.json`**: Standardizes typescript compiler behaviors (strict null checking, path mappings, out directory, source maps).
* **`.env` / `.env.example`**: Externalizes server behaviors so code changes aren't required when shifting between environments (Development, Staging, Production).

### 2. Core Application Lifecycle (`src/`)
* **`server.ts`**: The execution bootstrapper. Separating this from `app.ts` is crucial because it decouples HTTP networking configurations (socket bounds, cluster nodes, cluster modes) from express request-routing handlers. It handles process signals (SIGTERM/SIGINT) to close DB connections gracefully.
* **`app.ts`**: The express container setup. Organizes middlewares (parsers, rate limits, CORS) and registers routes, delegating requests downstream.
* **`config/`**: Contains central configuration singletons. Consolidates initializations like CORS options, environment variables validations, and DB clients.
* **`middleware/`**: Code that runs between a client sending a request and the request hitting the core handlers. Middlewares guard endpoints, check auth, rate-limit access, and capture faults.
* **`modules/`**: Directory reserved for feature-based code. Inside `modules/`, folders like `auth/`, `users/`, and `analytics/` will hold their respective routes, controllers, services, and validations. This prevents project files from bloating and simplifies module isolation.
* **`utils/`**: General-purpose helpers that contain no business logic (e.g., standard formatters, generic calculators).

---

## Dependency Breakdown & Why They Are Used

| Package | Purpose | Architectural Benefit |
| :--- | :--- | :--- |
| **`express`** | Core Router and Framework | Fast, unopinionated minimalist routing engine for API endpoints. |
| **`typescript`** | Compiled Language | Static typing, early compilation feedback, and structured object contracts. |
| **`prisma` / `@prisma/client`**| Database ORM | Automatic SQL injection defense, auto-generated TypeScript database clients, and structured migration pipelines. |
| **`zod`** | Schema Validation | Validates incoming payloads at runtime, matching TS types. Prevents invalid data from entering controllers. |
| **`cors`** | Cross-Origin Policies | Controls which domains can request server resources, protecting against CSFR-style attacks. |
| **`helmet`** | HTTP Headers Security | Automatically configures secure HTTP response headers to prevent MIME sniffing, clickjacking, etc. |
| **`cookie-parser`** | Cookie Parsing | Parses cookies into `req.cookies`, vital for secure `HttpOnly` JWT storage. |
| **`express-rate-limit`**| Rate Limiting | Defends against brute-force attacks and DDoS by tracking IP access windows. |
| **`morgan`** | Request Logging | Automatically logs client requests (`GET /api/v1 200 - 4.5ms`) for monitoring. |
| **`bcrypt`** | Password Hashing | Slow-hashing algorithm utilizing salts to prevent dictionary attacks on credentials. |
| **`jsonwebtoken`** | Authorization | Creates stateless cryptography tokens representing user claims for secure state-management. |
| **`nodemailer`** | Email Delivery | Client email notification engine. |
| **`multer`** | Multi-part Form Handler | Upload files (e.g., PDFs, invoices, spreadsheets) using stream parsing. |
| **`dotenv`** | Config Loader | Imports variables from `.env` directly into node's `process.env`. |
| **`rimraf`** | Directory Sweeper | Clears build artifact folders (`dist/`) before compilation to avoid legacy file caching. |
| **`ts-node-dev`** | Dev Runtime Runner | Restarts runtime on file change and supports TypeScript compilation on-the-fly. |

---

## Architecture Decisions

Here is a brief summary of the architectural choices made for this backend system:

- **Why Express.js:** It is a minimal, lightweight, and highly unopinionated web framework. This allows us to establish a clean, customized folder layout (Clean Architecture) and maintain maximum control over our middleware chain without the boilerplate of heavier frameworks.
- **Why Prisma ORM:** It provides an auto-generated, type-safe query builder that automatically matches our PostgreSQL schema. It avoids runtime query errors, provides clean SQL injection prevention, and comes with a built-in migration management engine (`prisma migrate`).
- **Why Zod:** It allows us to perform strict validation of incoming requests and environment configs at runtime. By mapping schemas to TypeScript types, we fail-fast (crash instantly on startup if `.env` is incorrect) and shield core application layers from invalid input.
- **Why Centralized Error Handling:** Rather than repeating standard try/catch logic and response builders in every controller, a centralized Express error middleware captures all exceptions, parses operational errors, maps database constraints, and formats standard JSON error payloads.
- **Why Modular Architecture:** Organizes features into dedicated folders (under `src/modules/`). As the application grows, each feature (e.g. authentication, portal accounts) houses its own routes, controllers, validations, and tests together. This keeps the codebase highly scalable and maintains low coupling.
- **Why Custom Logger Abstraction:** By wrapping console logs in a standard `logger` object, we decouple log statements throughout the app from any specific log library. Swapping the logging mechanism (e.g., to Winston or Pino) in the future only requires changing a single file (`logger.ts`).
- **Why TypeScript:** Static typing prevents simple references or typings issues from reaching production, documents the object shapes within the codebase, and speeds up developers' speed through IDE code completions.

---

## Installation & Setup

### 1. Prerequisites
Verify you have [Node.js](https://nodejs.org/) installed:
```bash
node -v
npm -v
```

### 2. Dependency Installation
Navigate into the `backend/` directory and run npm install:
```bash
cd backend
npm install
```

### 3. Database Migration / Generation
Prisma generates its internal client types based on your schema. Generates types directly inside `node_modules/@prisma/client`:
```bash
npm run prisma:generate
```
*Note: Database migrations will be initialized once PostgreSQL is installed and database credentials are configured in `.env`.*

### 4. Running the Development Server
Runs the application with hot reloading enabled:
```bash
npm run dev
```

The server will start, log that it is in `development` mode, check for connection with the database (which will gracefully warn that PostgreSQL is offline since the placeholder URL is used), and verify the health checks.

### 5. Compiling for Production
Compiles TypeScript into highly optimized Javascript inside the `dist/` directory:
```bash
npm run build
```

To run the compiled production bundle:
```bash
npm run start
```

---

## Health Check Verification
To verify the foundation, check the health endpoint:
```bash
curl http://localhost:5000/api/v1/health
```

**Expected JSON Response (Offline Database):**
```json
{
  "success": false,
  "message": "Database is unreachable.",
  "data": {
    "status": "UP",
    "database": "unreachable",
    "environment": "development",
    "uptime": "5s",
    "timestamp": "2026-07-22T14:43:00.000Z"
  },
  "timestamp": "2026-07-22T14:43:00.000Z"
}
```
*(HTTP status code is `503 Service Unavailable` if database is disconnected/unreachable, and `200 OK` if the database is online.)*
