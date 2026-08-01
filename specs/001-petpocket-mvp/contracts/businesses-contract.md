# Wasp Interface Contract: Businesses & Search

**Module**: `src/businesses`  
**Feature Branch**: `001-petpocket-mvp`

---

## Operations Summary

| Operation Name | Type | Authorization | Description |
|---|---|---|---|
| `searchNearbyBusinesses` | Query | Public / Auth | Search clinics within geographical radius ordered by proximity |
| `getBusinessProfile` | Query | Public / Auth | Get clinic details, address, and operating hours |
| `updateBusinessProfile` | Action | `VET_BUSINESS` | Manage clinic profile, coordinates, and schedules |

---

## Contract Schemas

### 1. `searchNearbyBusinesses`
- **Input**:
  ```ts
  {
    latitude: number;
    longitude: number;
    radiusKm?: number; // Default: 10
  }
  ```
- **Output**:
  ```ts
  Array<{
    id: string;
    name: string;
    address: string;
    phone: string;
    latitude: number;
    longitude: number;
    distanceKm: number;
    isOpenNow: boolean;
  }>
  ```
