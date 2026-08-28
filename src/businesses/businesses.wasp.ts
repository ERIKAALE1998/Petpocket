import { action, page, query, route, type Spec } from "@wasp.sh/spec";

import {
  getBusinessProfile,
  searchNearbyBusinesses,
  updateBusinessProfile,
} from "./operations" with { type: "ref" };
import { ClinicSearchPage } from "./views/ClinicSearchPage" with { type: "ref" };

export const businessesSpec: Spec = [
  route("SearchRoute", "/search", page(ClinicSearchPage)),

  query(searchNearbyBusinesses, { entities: ["Business"] }),
  query(getBusinessProfile, { entities: ["Business"] }),
  action(updateBusinessProfile, { entities: ["Business"] }),
];
