# Implementation Plan: PetPocket — MVP

**Branch**: `001-petpocket-mvp` | **Date**: 2026-08-01 | **Spec**: [spec.md](file:///c:/Users/erika/Desktop/Petpocket/specs/001-petpocket-mvp/spec.md)

**Input**: Feature specification from [`specs/001-petpocket-mvp/spec.md`](file:///c:/Users/erika/Desktop/Petpocket/specs/001-petpocket-mvp/spec.md)

---

## Summary

The objective is to implement the core MVP of PetPocket on top of the existing Open SaaS (`wasp-lang/open-saas`) boilerplate. The MVP delivers 4 primary capabilities aligned with the corrected scope (August 1, 2026):

1. **Clinical Care & Follow-Up Tracking (User Story 1)**: Veterinary businesses register completed clinical attention (consultations, vaccines, deworming, surgeries) and define the next follow-up/control date (`nextDueDate` in `MedicalRecord`). Pet owners view this medical record in read-only mode (no self-service booking or slot selection).
2. **Automated Reminders (User Story 2)**: Automated background reminders for vaccines and upcoming follow-ups generated via Wasp cron jobs querying `MedicalRecord.nextDueDate`.
3. **Digital Medical History (User Story 3)**: Centralized, owner-owned digital medical records portable across clinics.
4. **Proximity Search (User Story 4)**: Geolocation-based discovery of nearby veterinary clinics using PostgreSQL distance calculations.

All features leverage the built-in Open SaaS stack (Wasp-lang `^0.25.0`, React, Node.js/TypeScript, Prisma ORM, PostgreSQL, Wasp Auth). No external frameworks or new dependencies are introduced. The built-in Stripe payment module remains inactive for this phase.

---

## Technical Context

**Language/Version**: TypeScript 5.9 / Node.js 20+ (ES Modules)  
**Primary Stack**: Base Open SaaS — Wasp framework `^0.25.0`, React 19, Tailwind CSS, Prisma ORM  
**Storage**: PostgreSQL (via Prisma ORM)  
**Testing**: Vitest (unit/integration) / Playwright (E2E)  
**Target Platform**: Web App & Mobile Web PWA  
**Project Type**: Full-stack Web Application (Wasp framework)  
**Performance Goals**: Sub-2s location search response, sub-second medical record retrieval  
**Constraints**: 
- Scope adjustment (2026-08-01): No appointment booking / self-scheduling engine. Vet registers care + next control date; owner reads only.
- Strict RBAC across `PET_OWNER`, `VET_BUSINESS`, and `ADMIN`.
- Store e-commerce (FR-009) and advanced filters are excluded from MVP.
- Stripe payment module remains inactive for MVP.

---

## Constitution Check

*GATE: Passed before Phase 0 research & Phase 1 design.*

| Principle | Compliance Status | Rationale |
|---|---|---|
| **I. Fidelidad a la Investigación** | ✅ PASS | All 4 MVP features derive directly from documented interviews in `spec.md`, incorporating the August 1, 2026 scope correction. |
| **II. Alcance de MVP Estricto** | ✅ PASS | Store e-commerce (FR-009), advanced search filters, and appointment self-booking are explicitly excluded from this plan. |
| **III. Trazabilidad de Decisiones** | ✅ PASS | Decision records, role access rules, and qualitative success metrics are fully documented. |
| **IV. Simplicidad sobre Abstracción** | ✅ PASS | Reuses built-in Open SaaS / Wasp mechanisms exclusively (Prisma ORM, Wasp Jobs, Wasp Auth). Zero external dependencies added. |
| **V. Seguridad de Datos Sensibles (RBAC)** | ✅ PASS | User model extended with `role` enum (`PET_OWNER`, `VET_BUSINESS`, `ADMIN`). Access control enforced on all actions/queries. |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-petpocket-mvp/
├── spec.md              # Feature specification (corrected Aug 1, 2026)
├── plan.md              # This implementation plan
├── research.md          # Architectural decisions & technical context
├── data-model.md        # Prisma schema & ER diagram (MedicalRecord with nextDueDate)
├── quickstart.md        # E2E validation scenarios
└── contracts/           # Wasp actions & queries contracts
    ├── medical-records-contract.md
    ├── businesses-contract.md
    └── reminders-contract.md
```

### Source Code Layout (repository root)

```text
schema.prisma             # Extended with User (role), Pet, Business, MedicalRecord, Reminder models
main.wasp.ts              # Root Wasp spec incorporating feature specs

src/
├── medical-records/     # Clinical care registration & medical history module
│   ├── medical-records.wasp.ts
│   ├── operations.ts    # Actions (addMedicalRecord) & Queries (getPetMedicalHistory)
│   └── views/           # Timeline & medical record components
│
├── businesses/          # Veterinary business & proximity search module
│   ├── businesses.wasp.ts
│   ├── operations.ts    # Geolocation search & profile queries
│   └── views/           # Clinic directory & profile components
│
├── reminders/           # Automated reminder job module
│   ├── reminders.wasp.ts
│   ├── jobs.ts          # Wasp background cron job definitions (daily check of nextDueDate)
│   └── views/           # Reminder alert list components
│
├── pets/                # Pet management module for pet owners
│   ├── pets.wasp.ts
│   ├── operations.ts    # Pet CRUD actions & queries
│   └── views/           # Pet profile & read-only history components
│
├── auth/                # Extended Open SaaS Auth (RBAC role assignments)
└── user/                # Extended User model handlers
```

**Structure Decision**: Preserves the exact Open SaaS modular `.wasp.ts` feature organization pattern under `src/`. No base project restructuring.

---

## Complexity Tracking

| Violation / Complexity | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| PostGIS / Haversine Raw SQL in Prisma | Proximity search for nearby veterinary clinics | Third-party GIS API (Algolia / Google Maps API) rejected to avoid extra costs & external dependencies |
| Wasp Native Cron Jobs | Automated daily scanning of `nextDueDate` for vaccine/control reminders | External cron service (AWS EventBridge) rejected to maintain single-codebase simplicity within Wasp framework |
