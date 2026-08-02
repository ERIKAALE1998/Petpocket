# Wasp Interface Contract: Reminders & Notifications

**Module**: `src/reminders`  
**Feature Branch**: `001-petpocket-mvp`

---

## Operations Summary

| Operation Name | Type | Authorization | Description |
|---|---|---|---|
| `getUserReminders` | Query | `PET_OWNER` | List active and upcoming reminders for current owner's pets |
| `getBusinessUpcomingReminders` | Query | `VET_BUSINESS` | List upcoming controls/reminders derived from nextDueDate entries |
| `triggerManualReminder` | Action | `VET_BUSINESS` | Dispatch reminder notification manually without individual WhatsApp typing |

---

## Contract Schemas

### 1. `getUserReminders`
- **Input**: `{}`
- **Output**:
  ```ts
  Array<{
    id: string;
    petId: string;
    petName: string;
    medicalRecordId?: string;
    title: string;
    scheduledFor: string; // ISO 8601
    status: 'PENDING' | 'SENT' | 'FAILED';
  }>
  ```

### 2. `getBusinessUpcomingReminders`
- **Input**:
  ```ts
  {
    daysAhead?: number; // Default: 14
  }
  ```
- **Output**:
  ```ts
  Array<{
    id: string;
    petName: string;
    ownerName: string;
    ownerPhone?: string;
    recordTitle: string;
    nextDueDate: string; // ISO 8601
    status: 'PENDING' | 'SENT' | 'FAILED';
  }>
  ```

### 3. `triggerManualReminder`
- **Input**:
  ```ts
  {
    reminderId: string;
  }
  ```
- **Output**:
  ```ts
  {
    success: boolean;
    sentAt: string; // ISO 8601
  }
  ```
