import { action, job, query, type Spec } from "@wasp.sh/spec";

import { checkVaccineRemindersJob } from "./jobs" with { type: "ref" };
import {
  getUserReminders,
  getBusinessUpcomingReminders,
  triggerManualReminder,
  getReminders,
  createReminder,
  toggleReminderStatus,
} from "./operations" with { type: "ref" };

export const remindersSpec: Spec = [
  job(checkVaccineRemindersJob, {
    executor: "PgBoss",
    schedule: {
      cron: "0 8 * * *", // Run daily at 08:00 UTC
    },
    entities: ["MedicalRecord", "Reminder", "Pet", "User", "NotificationLog"],
  }),

  query(getReminders, { entities: ["Reminder", "Pet", "MedicalRecord", "User"] }),
  query(getUserReminders, { entities: ["Reminder", "Pet", "MedicalRecord", "Business", "NotificationLog"] }),
  query(getBusinessUpcomingReminders, { entities: ["MedicalRecord", "Pet", "User", "Business", "Reminder", "NotificationLog"] }),

  action(createReminder, { entities: ["Reminder", "Pet", "User"] }),
  action(toggleReminderStatus, { entities: ["Reminder"] }),
  action(triggerManualReminder, { entities: ["MedicalRecord", "Reminder", "Pet", "NotificationLog"] }),
];
