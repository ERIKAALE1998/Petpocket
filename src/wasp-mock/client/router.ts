import { Link, useNavigate, useParams, useLocation } from "react-router";

export { Link, useNavigate, useParams, useLocation };

export const routes = {
  LandingPageRoute: {
    to: "/",
    build: () => "/",
  },
  PetsRoute: {
    to: "/pets",
    build: () => "/pets",
  },
  PetHistoryRoute: {
    to: "/pets/:petId/medical-history",
    build: (params: { petId: string }) => `/pets/${params.petId}/medical-history`,
  },
  RemindersRoute: {
    to: "/reminders",
    build: () => "/reminders",
  },
  LoginRoute: {
    to: "/login",
    build: () => "/login",
  },
  SignupRoute: {
    to: "/signup",
    build: () => "/signup",
  },
  PricingPageRoute: {
    to: "/pricing",
    build: () => "/pricing",
  },
  AccountRoute: {
    to: "/account",
    build: () => "/account",
  },
  AdminRoute: {
    to: "/admin",
    build: () => "/admin",
  },
  DemoAppRoute: {
    to: "/demo-ai-app",
    build: () => "/demo-ai-app",
  },
  FileUploadRoute: {
    to: "/file-upload",
    build: () => "/file-upload",
  },
};
