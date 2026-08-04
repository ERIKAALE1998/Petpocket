import { app, page, route } from "@wasp.sh/spec";

import { App } from "./src/client/App" with { type: "ref" };
import { NotFoundPage } from "./src/client/components/NotFoundPage" with { type: "ref" };
import { serverEnvValidationSchema } from "./src/env" with { type: "ref" };
import { LandingPage } from "./src/landing-page/LandingPage" with { type: "ref" };
import { seedMockUsers } from "./src/server/scripts/dbSeeds" with { type: "ref" };

import { adminSpec } from "./src/admin/admin.wasp";
import { analyticsSpec } from "./src/analytics/analytics.wasp";
import { authConfig, authSpec } from "./src/auth/auth.wasp";
import { head } from "./src/client/head.wasp";
import { demoAiAppSpec } from "./src/demo-ai-app/demo-ai-app.wasp";
import { fileUploadSpec } from "./src/file-upload/file-upload.wasp";
import { paymentSpec } from "./src/payment/payment.wasp";
import { emailSender } from "./src/server/emailSender.wasp";
import { userSpec } from "./src/user/user.wasp";

import { petsSpec } from "./src/pets/pets.wasp";
import { medicalRecordsSpec } from "./src/medical-records/medical-records.wasp";
import { businessesSpec } from "./src/businesses/businesses.wasp";
import { remindersSpec } from "./src/reminders/reminders.wasp";
import { MedicalPassportPage } from "./src/medical-records/views/MedicalPassportPage" with { type: "ref" };
import { ReminderListPage } from "./src/reminders/views/ReminderListPage" with { type: "ref" };

export default app({
  name: "PetPocket",
  wasp: { version: "^0.25.0" },
  title: "PetPocket — Cuidado y Seguimiento Veterinario Digital",
  head,
  auth: authConfig,
  db: {
    // Run `wasp db seed` to seed the database with the seed functions below:
    seeds: [
      seedMockUsers,
    ],
  },
  client: {
    rootComponent: App,
  },
  server: {
    envValidationSchema: serverEnvValidationSchema,
  },
  emailSender,
  spec: [
    route("LandingPageRoute", "/", page(LandingPage), { prerender: true }),
    route("NotFoundRoute", "*", page(NotFoundPage)),
    route("PetHistoryRoute", "/pets/:petId/medical-history", page(MedicalPassportPage, { authRequired: true })),
    route("RemindersRoute", "/reminders", page(ReminderListPage, { authRequired: true })),
    authSpec,
    userSpec,
    demoAiAppSpec,
    paymentSpec,
    fileUploadSpec,
    analyticsSpec,
    adminSpec,
    petsSpec,
    medicalRecordsSpec,
    businessesSpec,
    remindersSpec,
  ],
});
