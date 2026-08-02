import { action, job, query, type Spec } from "@wasp.sh/spec";

import { checkVaccineRemindersJob } from "./jobs" with { type: "ref" };
import {
  getUserReminders,
  getBusinessUpcomingReminders,
  triggerManualReminder,
} from "./operations" with { type: "ref" };

export const remindersSpec: Spec = [
  job("checkVaccineRemindersJob", {
    executor: "PgBoss",
    perform: {
      fn: checkVaccineRemindersJob,
    },
    schedule: {
      cron: "0 8 * * *", // Run daily at 08:00 UTC
    },
    entities: ["MedicalRecord", "Reminder", "Pet", "User"],
  }),

  query(getUserReminders, { entities: ["Reminder", "Pet", "MedicalRecord", "Business"] }),
  query(getBusinessUpcomingReminders, { entities: ["MedicalRecord", "Pet", "User", "Business", "Reminder"] }),
  action(triggerManualReminder, { entities: ["MedicalRecord", "Reminder", "Pet"] }),
];
