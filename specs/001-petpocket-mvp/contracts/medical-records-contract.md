# Wasp Interface Contract: Medical Records

**Module**: `src/medical-records`  
**Feature Branch**: `001-petpocket-mvp`

---

## Operations Summary

| Operation Name | Type | Authorization | Description |
|---|---|---|---|
| `getPetMedicalHistory` | Query | `PET_OWNER` \| `VET_BUSINESS` | Retrieve full vaccination and clinical history for a pet |
| `addMedicalRecord` | Action | `VET_BUSINESS` | Append a new vaccine, deworming, or clinical entry |

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
      nextDueDate?: string;     // ISO 8601
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
    dateAdministered: string; // ISO 8601
    nextDueDate?: string;     // ISO 8601
  }
  ```
- **Output**: `MedicalRecord`
- **Errors**:
  - `403 Forbidden`: User is not a registered `VET_BUSINESS`.
