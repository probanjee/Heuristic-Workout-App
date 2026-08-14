# 🏋️‍♂️ Adaptive Fitness Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-green.svg)](https://nodejs.org/)
[![tRPC](https://img.shields.io/badge/tRPC-v11-25c2a0.svg)](https://trpc.io/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646cff.svg)](https://vitejs.dev/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.44-c5f742.svg)](https://orm.drizzle.team/)
[![Vitest](https://img.shields.io/badge/Vitest-2.1-708090.svg)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An enterprise-grade, full-stack adaptive fitness engine designed for intelligent workout generation, real-time exercise telemetry tracking, and personalized physical wellness coaching. Built with strict end-to-end type safety, modern micro-architectural boundaries, and deterministic recommendation logic backed by guardrailed AI assistance.

---

## 📐 System Architecture

The platform follows a layered, modular architecture with end-to-end type safety spanning the database schema down to React components via tRPC and Zod validation.

```mermaid
flowchart TD
    subgraph Client ["Client Layer (React 19 + Vite)"]
        UI["Wouter Router & UI Views"]
        TQ["TanStack Query (v5)"]
        TRPC_C["tRPC Client (v11)"]
        UI --> TQ
        TQ --> TRPC_C
    end

    subgraph Server ["API & Application Layer (Node.js + Express)"]
        HTTP["Express HTTP Server"]
        AUTH_M["Auth Middleware & JWT (Jose)"]
        TRPC_S["tRPC Router & Zod Schemas"]
        ENG["Deterministic Workout Engine"]
        LLM["AI Assistant Bridge (invokeLLM)"]
        
        HTTP --> AUTH_M
        AUTH_M --> TRPC_S
        TRPC_S --> ENG
        TRPC_S --> LLM
    end

    subgraph Data ["Data & Storage Layer"]
        ORM["Drizzle ORM (MySQL Core)"]
        DB[(MySQL Database)]
        S3["AWS S3 / Storage Proxy"]
        
        TRPC_S --> ORM
        ORM --> DB
        TRPC_S --> S3
    end

    TRPC_C <-->|HTTP / JSON RPC| HTTP
```

### Key Architectural Principles
- **End-to-End Type Safety**: Shared TypeScript definitions and Zod schemas across client and server eliminate runtime contract mismatches.
- **Deterministic Recommendation Core**: Workout algorithms generate scientifically structured routines based on user fatigue, sleep quality, and equipment availability without relying on unpredictable LLM output for physical safety.
- **Guardrailed AI Integration**: Natural language fitness guidance is provided via an LLM bridge (`gpt-5-mini`), constrained strictly to explaining and supporting the deterministic engine's prescribed workout plan.
- **Security-in-Depth**: Express application includes OWASP-compliant security headers, strict JWT session cookie management with HTTP-only flags, and multi-channel auth challenge rate-limiting.

---

## ✨ Features & Capabilities

- **Deterministic Adaptive Engine**: Automatically calculates volume, intensity, sets, reps, and target muscle groups dynamically based on athlete profile metrics (fatigue score 1-5, sleep quality, workout frequency, available equipment, and exclusion constraints).
- **Real-Time Workout Execution & Telemetry**: Step-by-step guided workout interface with set logging, load tracking (kg), perceived exertion scores (RPE 1-10), and set completion timers.
- **Multi-Channel Authentication**:
  - OAuth 2.0 / OpenID Connect provider support
  - Mobile Phone OTP Challenge verification
  - Magic Link / Email verification & password reset challenges
- **Progress Analytics & Exercise Mix**: Interactive visualizations (Recharts) charting volume progression, daily streaks, muscle group activation distribution, and workout completion history over 7, 30, or 90-day intervals.
- **AI Fitness Assistant**: Context-aware assistant capable of clarifying movement mechanics, form guidance, and schedule adjustments while staying strictly within safe exercise boundaries.
- **Background Cron & Telemetry Services**: Scheduled jobs for active user streak verification, notification dispatching, and automated workout reminder callbacks.
- **Custom Profile & Asset Management**: Full profile customizer with AWS S3-backed avatar uploads, metric preferences, and custom goal settings.

---

## 🛠️ Tech Stack

### Frontend Stack
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `^19.2.1` | Modern UI rendering library |
| **TypeScript** | `5.9.3` | Type-safe static analysis |
| **Vite** | `^7.1.7` | Next-gen frontend bundling & dev server |
| **Wouter** | `^3.3.5` | Lightweight declarative client routing |
| **TanStack Query** | `^5.90.2` | Async state management & caching |
| **tRPC Client** | `^11.6.0` | End-to-end type-safe RPC client |
| **Tailwind CSS** | `^4.1.14` | Utility-first styling engine |
| **Radix UI** | Latest | Unstyled, accessible UI component primitives |
| **Lucide React** | `^0.453.0` | Modern SVG iconography |
| **Recharts** | `^2.15.2` | Data visualization charts |
| **Framer Motion** | `^12.23.22` | Micro-animations and layout transitions |

### Backend Stack
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `>=20.x` | JavaScript server runtime |
| **Express** | `^4.21.2` | Enterprise web application framework |
| **tRPC Server** | `^11.6.0` | Type-safe API procedure handler |
| **Zod** | `^4.1.12` | Runtime validation & schema declaration |
| **Drizzle ORM** | `^0.44.5` | Type-safe SQL object-relational mapping |
| **MySQL2** | `^3.15.0` | High-performance MySQL database client |
| **AWS SDK S3** | `^3.693.0` | Object storage integration for avatar assets |
| **Jose** | `6.1.0` | Lightweight JOSE/JWT signing & verification |

### Testing & Tooling
| Technology | Purpose |
| :--- | :--- |
| **Vitest** | Blazing-fast unit & integration test runner |
| **JSDOM** | In-memory DOM emulation for React component testing |
| **Prettier** | Code formatting enforcement |
| **Drizzle Kit** | Database migration & schema management CLI |

---

## 📂 Project Structure

```
adaptive-fitness-platform/
├── client/                     # Frontend Application
│   ├── index.html              # HTML Shell
│   └── src/
│       ├── components/         # Reusable UI primitives (Radix UI + Tailwind)
│       ├── contexts/           # React Context Providers (Auth, Theme)
│       ├── hooks/              # Custom React Hooks (tRPC, Media Query)
│       ├── lib/                # Client-side utility functions & validators
│       ├── pages/              # Application views (Home, Onboarding, Workout, Progress)
│       ├── App.tsx             # Application Root & Route Registry
│       ├── index.css           # Global Styles & Tailwind Configuration
│       └── main.tsx            # DOM Entrypoint
├── server/                     # Backend Application
│   ├── _core/                  # Core infrastructure setup
│   │   ├── index.ts            # Server entrypoint (Express + Vite middleware)
│   │   ├── trpc.ts             # tRPC initialization & procedure contexts
│   │   ├── cookies.ts          # Session cookie configuration
│   │   ├── llm.ts              # AI model bridge abstraction
│   │   └── sdk.ts              # OAuth & token SDK setup
│   ├── auth/                   # Authentication procedures & providers
│   ├── scheduled/              # Background scheduled jobs (Reminders, Streaks)
│   ├── db.ts                   # Database query handlers & repositories
│   ├── recommendations.ts      # Deterministic recommendation builder
│   ├── routers.ts              # Root tRPC Router definition
│   ├── security.ts             # Security header middleware
│   ├── storage.ts              # AWS S3 / local file storage abstraction
│   └── workoutEngine.ts        # Core adaptive workout engine
├── drizzle/                    # Database Schema & Migrations
│   ├── schema.ts               # Drizzle ORM database tables & relations
│   └── migrations/             # SQL Migration files
├── shared/                     # Shared Types & Constants
│   ├── const.ts                # Cross-boundary constants
│   └── types.ts                # Shared TypeScript interfaces
├── drizzle.config.ts           # Drizzle Kit CLI configuration
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript compiler config
└── vite.config.ts              # Vite bundler config
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: `v20.x` or higher
- **pnpm** (recommended) or **npm** / **yarn**
- **MySQL Database**: Running instance (v8.0+ recommended)

### 2. Environment Configuration
Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=3000

# Database Connection String
DATABASE_URL=mysql://root:password@localhost:3306/adaptive_fitness

# Authentication Secrets
JWT_SECRET=your_super_secret_jwt_key_here
OAUTH_SERVER_URL=http://localhost:3000

# AWS S3 Configuration (Optional for asset uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your_bucket_name
```

### 3. Install Dependencies
```bash
pnpm install
```

### 4. Database Setup & Migrations
Generate and push database schema tables to your MySQL instance:
```bash
pnpm db:push
```

---

## 🏃 Running the Application

### Development Mode
Runs the backend Express server with `tsx` hot-reloading alongside Vite development server middleware:
```bash
pnpm dev
```
Access the application at `http://localhost:3000`.

### Type Checking
Run the TypeScript compiler to ensure strict type compliance across client and server codebase:
```bash
pnpm check
```

### Code Formatting & Linting
```bash
# Check code style compliance
pnpm lint

# Auto-format codebase
pnpm format
```

### Production Build & Deployment
Build the client static assets with Vite and bundle the Node backend with esbuild:
```bash
# Build bundle
pnpm build

# Start production server
pnpm start
```

---

## 🧪 Testing Strategy & Execution

The project maintains comprehensive test coverage across backend logic, security procedures, recommendation engines, and React client components.

### Run All Unit & Integration Tests
```bash
pnpm test
```

### Key Tested Subsystems
- **`workoutEngine.test.ts`**: Verifies deterministic exercise selection, muscle balancing, fatigue scaling, and equipment filter algorithms.
- **`auth.service.security.test.ts`**: Tests challenge hashing, OTP verification rate limits, and password reset flows.
- **`workout.execution.persistence.test.ts`**: Ensures set logging integrity and transaction rollbacks on failure.
- **`scheduled/reminders.test.ts` & `scheduled.streaks.test.ts`**: Verifies background cron trigger validation and streak progression logic.
- **`AuthEntry.interaction.test.tsx`**: Tests frontend login form interactions, input validation, and user feedback states.

---

## 🔐 API Reference Overview (tRPC Procedures)

| Namespace | Procedure | Type | Description |
| :--- | :--- | :--- | :--- |
| `auth` | `me` | `Query` | Retrieves current authenticated session user |
| `auth` | `logout` | `Mutation` | Invalidates session cookie and clears credentials |
| `profile` | `get` | `Query` | Fetches active athlete profile metrics |
| `profile` | `save` | `Mutation` | Updates onboarding step, metrics, and goals |
| `profile` | `uploadAvatar` | `Mutation` | Processes base64 avatar images & stores to S3 |
| `workout` | `today` | `Query` | Generates today's adaptive workout plan |
| `workout` | `start` | `Mutation` | Persists daily workout instance into database |
| `workout` | `logSet` | `Mutation` | Records weight, reps, and RPE for an exercise set |
| `workout` | `complete` | `Mutation` | Finalizes workout, records energy level & notes |
| `analytics` | `exerciseMix` | `Query` | Aggregates volume breakdown by target muscle group |
| `progress` | `summary` | `Query` | Returns streak count, total volume, & completion rate |
| `assistant` | `ask` | `Mutation` | Queries guardrailed AI assistant for workout guidance |

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Developed with focus on software craftsmanship, type safety, and clean architecture.
</p>
