# Quickstart Validation Guide: PetPocket — MVP

**Feature Branch**: `001-petpocket-mvp`  
**Date**: 2026-08-01  
**Spec**: [spec.md](file:///c:/Users/TonyJ0711/Desktop/Documentos/petpocket/specs/001-petpocket-mvp/spec.md)

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

### Scenario 2: Anti-Collision Appointment Booking (User Story 1)
- **Goal**: Verify that two users booking the same slot results in exactly 1 confirmed booking and 1 rejected attempt.
- **Steps**:
  1. Login as Owner A and select clinic "Helpet" for 2026-08-10 at 10:00 AM.
  2. Simultaneously submit booking for Owner B for 2026-08-10 at 10:00 AM.
  3. **Expected Result**: Owner A receives a confirmed appointment response; Owner B receives a clear collision notification and the slot is removed from availability.

### Scenario 3: Automated Vaccine Reminders (User Story 2)
- **Goal**: Verify that upcoming vaccine due dates trigger automatic reminders.
- **Steps**:
  1. Add a `MedicalRecord` entry for pet "Firulais" with `nextDueDate` set to 7 days from today.
  2. Execute background job check via Wasp task or test runner.
  3. **Expected Result**: A new `Reminder` record with status `PENDING` is generated and dispatched via email/in-app notification.

### Scenario 4: Digital Medical Record Access & Portability (User Story 3)
- **Goal**: Verify pet owner retains access to medical records across clinics.
- **Steps**:
  1. Vet Clinic "Helpet" adds a vaccination record for pet "Firulais".
  2. Owner logs in and checks pet medical history under `/pets/:petId/medical-history`.
  3. Owner visits Clinic "Pelusa" and presents digital record.
  4. **Expected Result**: Complete treatment timeline is visible without requiring paper booklets.
