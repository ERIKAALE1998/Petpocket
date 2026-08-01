# Wasp Interface Contract: Appointments

**Module**: `src/appointments`  
**Feature Branch**: `001-petpocket-mvp`

---

## Operations Summary

| Operation Name | Type | Authorization | Description |
|---|---|---|---|
| `getBusinessAvailability` | Query | Public / Auth | Retrieves open slots for a specific business and date |
| `getUserAppointments` | Query | `PET_OWNER` | List appointments for pets owned by current user |
| `getBusinessAppointments` | Query | `VET_BUSINESS` | List upcoming & historical appointments for business |
| `createAppointment` | Action | `PET_OWNER` | Book an appointment slot atomically |
| `cancelAppointment` | Action | `PET_OWNER` \| `VET_BUSINESS` | Cancel appointment and free schedule slot |

---

## Contract Schemas

### 1. `getBusinessAvailability`
- **Input**:
  ```ts
  {
    businessId: string;
    date: string; // YYYY-MM-DD
  }
  ```
- **Output**:
  ```ts
  {
    businessId: string;
    date: string;
    availableSlots: Array<{
      dateTime: string; // ISO 8601
      isAvailable: boolean;
    }>;
  }
  ```

### 2. `createAppointment`
- **Input**:
  ```ts
  {
    petId: string;
    businessId: string;
    dateTime: string; // ISO 8601
    reason?: string;
  }
  ```
- **Output**: `Appointment`
- **Errors**:
  - `401 Unauthorized`: User not authenticated.
  - `403 Forbidden`: User does not own specified `petId`.
  - `409 Conflict`: Slot already booked by another user (`SlotAlreadyBookedError`).

### 3. `cancelAppointment`
- **Input**:
  ```ts
  {
    appointmentId: string;
    reason?: string;
  }
  ```
- **Output**:
  ```ts
  {
    success: boolean;
    appointmentId: string;
    status: 'CANCELLED';
  }
  ```
