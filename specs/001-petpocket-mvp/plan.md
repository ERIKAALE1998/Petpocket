# Implementation Plan: PetPocket — MVP

**Branch**: `001-petpocket-mvp` | **Date**: 2026-08-01 | **Spec**: [spec.md](file:///c:/Users/TonyJ0711/Desktop/Documentos/petpocket/specs/001-petpocket-mvp/spec.md)

**Input**: Feature specification from [`specs/001-petpocket-mvp/spec.md`](file:///c:/Users/TonyJ0711/Desktop/Documentos/petpocket/specs/001-petpocket-mvp/spec.md)

---

## Summary

The objective is to implement the core MVP of PetPocket on top of the existing Open SaaS (`wasp-lang/open-saas`) boilerplate. The MVP delivers 4 primary capabilities:
1. **Appointment Scheduling** with atomic anti-collision slot locking.
2. **Automated Reminders** for vaccines and controls using Wasp cron jobs.
3. **Digital Medical Records** owned by pet owners and portable across clinics.
4. **Proximity Search** for nearby veterinary clinics using PostgreSQL distance calculations.

All features leverage the built-in Open SaaS stack (React, Node.js/TypeScript, Prisma ORM, PostgreSQL, Wasp Auth). No external frameworks or new dependencies are introduced. The built-in Stripe payment module remains inactive for this phase.

---

## Technical Context

**Language/Version**: TypeScript 5.9 / Node.js 20+ (ES Modules)  
**Primary Dependencies**: Open SaaS (Wasp framework `^0.25.0`), React 19, Tailwind CSS, Prisma ORM  
**Storage**: PostgreSQL (via Prisma ORM)  
**Testing**: Vitest (unit/integration) / Playwright (E2E)  
**Target Platform**: Web App & Mobile Web PWA  
**Project Type**: Full-stack Web Application (Wasp framework)  
**Performance Goals**: Sub-2s location search response, sub-second atomic slot locking, instant medical record retrieval  
**Constraints**: Zero double-booking (anti-collision slot lock), strict RBAC across `PET_OWNER`, `VET_BUSINESS`, and `ADMIN`. Stripe module inactive for MVP.

---

## Constitution Check

*GATE: Passed before Phase 0 research & Phase 1 design.*

| Principle | Compliance Status | Rationale |
|---|---|---|
| **I. Fidelidad a la Investigación** | ✅ PASS | All 4 MVP features derive directly from documented interviews in `spec.md`. |
| **II. Alcance de MVP Estricto** | ✅ PASS | Store e-commerce (FR-009) and advanced filters are explicitly excluded from this plan. |
| **III. Trazabilidad de Decisiones** | ✅ PASS | Risk notes and qualitative success metrics are fully documented. |
| **IV. Simplicidad sobre Abstracción** | ✅ PASS | Reuses built-in Open SaaS / Wasp mechanisms exclusively. Zero external dependencies added. |
| **V. Seguridad de Datos Sensibles (RBAC)** | ✅ PASS | User model extended with `role` enum. Access control enforced on all actions/queries. |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-petpocket-mvp/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Phase 0 architectural decisions & technical context
├── data-model.md        # Phase 1 Prisma schema & ER diagram
├── quickstart.md        # Phase 1 E2E validation scenarios
└── contracts/           # Phase 1 Wasp actions & queries contracts
    ├── appointments-contract.md
    ├── medical-records-contract.md
    ├── businesses-contract.md
    └── reminders-contract.md
```

### Source Code Layout (repository root)

```text
schema.prisma             # Extended with Pet, Business, Appointment, MedicalRecord, Reminder models
main.wasp.ts              # Root Wasp spec incorporating feature specs

src/
├── appointments/         # Appointment scheduling module
│   ├── appointments.wasp.ts
│   ├── operations.ts    # Actions & queries (atomic transactions)
│   └── views/           # Booking & calendar UI components
│
├── medical-records/     # Digital medical history module
│   ├── medical-records.wasp.ts
│   ├── operations.ts    # Actions & queries for health events
│   └── views/           # Timeline & medical passport components
│
├── businesses/          # Veterinary business & search module
│   ├── businesses.wasp.ts
│   ├── operations.ts    # Geolocation search queries
│   └── views/           # Clinic directory & profile components
│
├── reminders/           # Automated reminder job module
│   ├── reminders.wasp.ts
│   ├── jobs.ts          # Wasp background cron job definitions
│   └── views/           # Reminder alert list components
│
├── pets/                # Pet management module
│   ├── pets.wasp.ts
│   ├── operations.ts    # Pet CRUD actions
│   └── views/           # Pet profile components
│
├── auth/                # Extended Open SaaS Auth (RBAC role assignments)
└── user/                # Extended User model handlers
```

**Structure Decision**: Preserves the exact Open SaaS modular `.wasp.ts` feature organization pattern under `src/`. No base project restructuring.

---

## Complexity Tracking

| Violation / Complexity | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Atomic Transactions in Prisma | Anti-collision requirement for simultaneous bookings | Caching lock (Redis) rejected to avoid adding external services per Principle IV |
| PostGIS / Haversine Raw SQL in Prisma | Proximity search for nearby veterinary clinics | Third-party GIS API (Algolia) rejected to avoid extra costs & external dependencies |
