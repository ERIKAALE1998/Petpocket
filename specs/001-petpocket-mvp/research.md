# Research & Architectural Decisions: PetPocket — MVP

**Feature Branch**: `001-petpocket-mvp`  
**Date**: 2026-08-01 (Corrected Scope)  
**Spec**: [spec.md](file:///c:/Users/erika/Desktop/Petpocket/specs/001-petpocket-mvp/spec.md)

---

## 1. Clinical Attention Registration & Follow-Up Tracking Engine

### Context & Challenge
Under the corrected MVP scope (August 1, 2026), pet owners do NOT book or reserve appointment slots directly. Instead, veterinary clinic staff register completed clinical attentions (vaccine, deworming, consultation, surgery) and record the next follow-up/control date (`nextDueDate`). Pet owners access this information in read-only mode from their profile.

### Decision
- **Mechanism**: Use `MedicalRecord` as the core clinical entity storing both completed treatments (`dateAdministered`) and scheduled follow-up dates (`nextDueDate`).
- **Pattern**:
  1. Action `addMedicalRecord` is restricted to authenticated `VET_BUSINESS` users.
  2. The action receives `petId`, `recordType`, `title`, `description`, `dateAdministered`, and optionally `nextDueDate`.
  3. Inside a Prisma transaction, the system creates the `MedicalRecord` entry and associates it with the business's `Business` profile and the target `Pet`.
  4. Query `getPetMedicalHistory` allows `PET_OWNER` users to view all clinical records for their registered pets in read-only mode, including upcoming control dates.
- **Rationale**: Replaces complex slot anti-collision logic with a straightforward clinical record flow that accurately matches veterinary operational reality and eliminates user booking friction.
- **Alternatives Considered**:
  - *Separate Appointment booking entity*: Rejected because user research showed pet owners do not self-schedule; clinics dictate follow-up dates post-attention.

---

## 2. Automated Reminders & Background Scheduling

### Context & Challenge
The system must generate and dispatch vaccination and control reminders automatically without manual staff messaging.

### Decision
- **Mechanism**: Use Wasp's built-in Job/Cron feature (`job` in Wasp spec).
- **Pattern**:
  1. Define a daily Wasp cron job (`checkVaccineRemindersJob`) executing at 08:00 UTC.
  2. Query `MedicalRecord` entries where `nextDueDate` falls within the reminder window (e.g., 7 days ahead) and no pending `Reminder` has been created for this record.
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
     - `VET_BUSINESS`: Has READ/WRITE access to create `MedicalRecord` entries for pets brought to their clinic.
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
  2. Search Query accepts `userLat`, `userLng`, `radiusKm` (default: 10km).
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
- **Mechanism**: Add a `role` Enum field to the Open SaaS `User` model (`PET_OWNER`, `VET_BUSINESS`, `ADMIN`) with `PET_OWNER` as default.
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
