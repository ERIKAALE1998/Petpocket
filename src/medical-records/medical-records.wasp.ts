import { action, query, type Spec } from "@wasp.sh/spec";

import {
  addMedicalRecord,
  getPetMedicalHistory,
  getBusinessMedicalRecords,
} from "./operations" with { type: "ref" };

export const medicalRecordsSpec: Spec = [
  query(getPetMedicalHistory, { entities: ["Pet", "MedicalRecord", "Business", "User"] }),
  query(getBusinessMedicalRecords, { entities: ["Business", "MedicalRecord", "Pet", "User"] }),
  action(addMedicalRecord, { entities: ["MedicalRecord", "Business", "Pet"] }),
];
