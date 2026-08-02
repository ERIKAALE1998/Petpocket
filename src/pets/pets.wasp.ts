import { action, page, query, route, type Spec } from "@wasp.sh/spec";

import { createPet, getPets } from "./operations" with { type: "ref" };
import { PetListPage } from "./views/PetListPage" with { type: "ref" };

export const petsSpec: Spec = [
  route("PetsRoute", "/pets", page(PetListPage, { authRequired: true })),

  query(getPets, { entities: ["Pet", "MedicalRecord"] }),
  action(createPet, { entities: ["Pet"] }),
];
