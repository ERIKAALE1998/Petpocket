# Wasp Interface Contract: Medical Records & Clinical Care

**Module**: `src/medical-records`  
**Feature Branch**: `001-petpocket-mvp`

---

## Operations Summary

| Operation Name | Type | Authorization | Description |
|---|---|---|---|
| `getPetMedicalHistory` | Query | `PET_OWNER` \| `VET_BUSINESS` | Retrieve full vaccination and clinical history for a pet, including next control dates (read-only for owner) |
| `addMedicalRecord` | Action | `VET_BUSINESS` | Register a new clinical attention (vaccine, deworming, consultation, surgery) and define next follow-up date |
| `getBusinessMedicalRecords` | Query | `VET_BUSINESS` | List all clinical attentions registered by the authenticated veterinary business |

---

## Contract Schemas

### 1. `getPetMedicalHistory`
- **Input**:
  ```ts
  {
    petId: string;
  }
  ```
- **Output**:
  ```ts
  {
    petId: string;
    petName: string;
    ownerName: string;
    records: Array<{
      id: string;
      recordType: 'VACCINE' | 'DEWORMING' | 'CONSULTATION' | 'SURGERY';
      title: string;
      description?: string;
      dateAdministered: string; // ISO 8601
      nextDueDate?: string;     // ISO 8601 (defined by vet for follow-up)
      businessId?: string;
      businessName?: string;
    }>;
  }
  ```

### 2. `addMedicalRecord`
- **Input**:
  ```ts
  {
    petId: string;
    recordType: 'VACCINE' | 'DEWORMING' | 'CONSULTATION' | 'SURGERY';
    title: string;
    description?: string;
    dateAdministered?: string; // ISO 8601 (Defaults to now)
    nextDueDate?: string;     // ISO 8601 (Next control date set by vet)
  }
  ```
- **Output**: `MedicalRecord`
- **Errors**:
  - `401 Unauthorized`: User not authenticated.
  - `403 Forbidden`: User is not a registered `VET_BUSINESS`.
  - `404 Not Found`: `petId` does not exist.

### 3. `getBusinessMedicalRecords`
- **Input**:
  ```ts
  {
    limit?: number;
    offset?: number;
  }
  ```
- **Output**:
  ```ts
  Array<{
    id: string;
    petId: string;
    petName: string;
    ownerName: string;
    recordType: string;
    title: string;
    dateAdministered: string;
    nextDueDate?: string;
  }>
  ```
