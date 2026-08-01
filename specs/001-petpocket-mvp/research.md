# Research & Architectural Decisions: PetPocket — MVP

**Feature Branch**: `001-petpocket-mvp`  
**Date**: 2026-08-01  
**Spec**: [spec.md](file:///c:/Users/TonyJ0711/Desktop/Documentos/petpocket/specs/001-petpocket-mvp/spec.md)

---

## 1. Appointment Scheduling & Anti-Collision Engine

### Context & Challenge
The system must guarantee zero double-booking across veterinary business hours without manual WhatsApp confirmation. When two pet owners attempt to book the exact same slot concurrently, only one booking must succeed.

### Decision
- **Mechanism**: Use Prisma interactive database transactions (`prisma.$transaction`) with PostgreSQL atomic conditional updates on appointment slot availability.
- **Pattern**:
  1. Business defines operating schedules and slot duration (e.g., 30 mins) stored as `BusinessSchedule` and `AppointmentSlot` records or dynamically calculated.
  2. Booking Action receives `businessId`, `slotTime`, `petId`, `serviceType`.
  3. Inside an atomic Prisma transaction:
     - Check if an active `Appointment` exists for `businessId` at `slotTime` (where status is `CONFIRMED` or `PENDING`).
     - If collision exists, abort transaction immediately with `SlotAlreadyBookedError`.
     - If clear, create `Appointment` with status `CONFIRMED`.
- **Rationale**: PostgreSQL ACID transaction guarantees atomic execution under concurrent requests. Prevents race conditions natively without extra caching infrastructure (e.g. Redis).
- **Alternatives Considered**:
  - *Redis Distributed Lock*: Rejected because adding Redis violates Principle IV (Simplicidad sobre Abstracción Prematura) since Open SaaS / PostgreSQL natively supports atomic transactions.

---

## 2. Automated Reminders & Background Scheduling

### Context & Challenge
The system must generate and dispatch vaccination and control reminders automatically without manual staff messaging.

### Decision
- **Mechanism**: Use Wasp's built-in Job/Cron feature (`job` in Wasp spec).
- **Pattern**:
  1. Define a daily Wasp cron job (`checkVaccineRemindersJob`) executing at 08:00 UTC.
  2. Query `MedicalRecord` entries where `nextDueDate` is within the configured window (e.g., 7 days ahead) and no `Reminder` has been created for this event.
  3. Create `Reminder` records with status `PENDING` and trigger system notification / email dispatch via Wasp's built-in `emailSender`.
  4. Allow veterinary business users to trigger explicit reminder dispatches from their dashboard for upcoming controls.
- **Rationale**: Reuses Wasp's native background job runner (`pg-boss` / Wasp job queue). Zero external infrastructure required.
- **Alternatives Considered**:
  - *External Cron Service (AWS EventBridge / Cron-job.org)*: Rejected to maintain single-codebase simplicity within Wasp framework.

---

## 3. Data Ownership & Medical Record Portability

### Context & Challenge
Medical history must belong to the pet owner and remain accessible even if the owner switches veterinary clinics.

### Decision
- **Mechanism**: Owner-centric authorization model.
- **Pattern**:
  1. `Pet` entity belongs to a `User` (the `PET_OWNER`).
  2. `MedicalRecord` is linked directly to `Pet` and references the `Business` (veterinary clinic) that created the entry.
  3. Access Control (RBAC):
     - `PET_OWNER`: Has READ access to all `MedicalRecord` entries belonging to their registered `Pet` objects at all times.
     - `VET_BUSINESS`: Has READ/WRITE access to `MedicalRecord` entries for pets that have an active or historical `Appointment` with that business.
     - `ADMIN`: Has platform oversight access.
- **Rationale**: Eliminates paper carnet dependency (Isaac scenario) and prevents data lock-in to a single clinic.

---

## 4. Location-Based Proximity Search

### Context & Challenge
Pet owners need to find nearby veterinary clinics based on their current geographic coordinates (latitude and longitude) without requiring external complex GIS clusters.

### Decision
- **Mechanism**: PostgreSQL Haversine distance formula calculation via raw SQL query in Prisma (`prisma.$queryRaw`).
- **Pattern**:
  1. `Business` model stores `latitude` (Float) and `longitude` (Float).
  2. Search Query accepts `userLat`, `userLng`, `maxDistanceKm` (default: 10km).
  3. PostgreSQL calculates distance using standard Haversine formula:
     $$\text{Distance} = 6371 \times 2 \times \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta \text{lng}}{2}\right)}\right)$$
  4. Returns `Business` records ordered by calculated distance.
- **Rationale**: High performance, zero extra dependencies, native to PostgreSQL.
- **Alternatives Considered**:
  - *Algolia / GeoSearch SaaS*: Rejected per MVP Scope & Open SaaS foundation rules.

---

## 5. RBAC & System Roles Integration in Open SaaS

### Context & Challenge
Open SaaS comes with a default `User` model (`isAdmin` Boolean). PetPocket requires distinct business roles (`PET_OWNER`, `VET_BUSINESS`, `ADMIN`).

### Decision
- **Mechanism**: Add a `role` String / Enum field to the Open SaaS `User` model (`PET_OWNER`, `VET_BUSINESS`, `ADMIN`) with `PET_OWNER` as default.
- **Pattern**:
  1. Wasp actions and queries inspect `context.user` and enforce role checks:
     ```ts
     if (context.user.role !== 'VET_BUSINESS') {
       throw new HttpError(403, 'Acceso restringido a negocios veterinarios');
     }
     ```
  2. `VET_BUSINESS` users complete a Business Profile (`Business` entity).
  3. `PET_OWNER` users complete their Pet Profiles (`Pet` entity).
- **Rationale**: Seamlessly extends existing Open SaaS authentication without altering core auth flow.
