# Quickstart Validation Guide: PetPocket — MVP

**Feature Branch**: `001-petpocket-mvp`  
**Date**: 2026-08-01 (Corrected Scope)  
**Spec**: [spec.md](file:///c:/Users/erika/Desktop/Petpocket/specs/001-petpocket-mvp/spec.md)

---

## 1. Prerequisites & Setup

1. Verify environment and Open SaaS setup:
   ```bash
   node --version
   npm --version
   ```
2. Start PostgreSQL database container or connection:
   ```bash
   ./tools/wasp db start
   ```
3. Run database migrations and seed data:
   ```bash
   ./tools/wasp db migrate-dev
   ```
4. Start development server:
   ```bash
   ./tools/wasp start
   ```

---

## 2. End-to-End Validation Scenarios

### Scenario 1: Proximity Search & Veterinary Discovery (User Story 4)
- **Goal**: Verify that a pet owner can discover nearby clinics based on location coordinates.
- **Steps**:
  1. Open app as `PET_OWNER` user.
  2. Navigate to search page `/search`.
  3. Allow geolocation access or enter coordinates (e.g. Lat: `-0.1807`, Lng: `-78.4678`).
  4. **Expected Result**: Nearby clinics (Helpet, Pelusa) appear ordered by distance within 2 seconds.

### Scenario 2: Clinical Attention Registration & Follow-Up Scheduling (User Story 1)
- **Goal**: Verify that a veterinary business can register completed care and define the next control date, while the pet owner views it in read-only mode.
- **Steps**:
  1. Login as `VET_BUSINESS` user (e.g. Clinic "Helpet").
  2. Select pet "Firulais" and submit clinical record entry (Type: `VACCINE`, Title: `Rabies Vaccine`, Next Control Date: `2026-09-01`).
  3. Log out and login as `PET_OWNER` user (owner of "Firulais").
  4. Navigate to pet profile `/pets/:petId`.
  5. **Expected Result**: The attention and next control date (`2026-09-01`) are visible in read-only mode. No edit, delete, or self-booking controls are available to the pet owner.

### Scenario 3: Automated Vaccine Reminders (User Story 2)
- **Goal**: Verify that upcoming vaccine due dates trigger automatic reminders.
- **Steps**:
  1. Ensure a `MedicalRecord` entry exists for pet "Firulais" with `nextDueDate` set to 7 days from today.
  2. Execute background job check via Wasp task or test runner (`checkVaccineRemindersJob`).
  3. **Expected Result**: A new `Reminder` record with status `PENDING` is generated and dispatched via email/in-app notification.

### Scenario 4: Digital Medical Record Access & Portability (User Story 3)
- **Goal**: Verify pet owner retains access to medical records across clinics.
- **Steps**:
  1. Vet Clinic "Helpet" adds a vaccination record for pet "Firulais".
  2. Owner logs in and checks pet medical history under `/pets/:petId/medical-history`.
  3. Owner visits Clinic "Pelusa" and presents digital record.
  4. **Expected Result**: Complete treatment timeline is visible without requiring paper booklets.
