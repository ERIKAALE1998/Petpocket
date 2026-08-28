import { routes } from "wasp/client/router";
import { BlogUrl, DocsUrl } from "../../../shared/common";
import type { NavigationItem } from "./NavBar";

const staticNavigationItems: NavigationItem[] = [
  { name: "Documentation", to: DocsUrl },
  { name: "Blog", to: BlogUrl },
];

export const marketingNavigationItems: NavigationItem[] = [
  { name: "Features", to: "/#features" },
  ...staticNavigationItems,
] as const;

export const petPocketNavigationItems: NavigationItem[] = [
  { name: "Mis Mascotas", to: routes.PetsRoute.to },
  { name: "Recordatorios", to: routes.RemindersRoute.to },
  { name: "Buscar Clínicas", to: routes.SearchRoute.to },
];
