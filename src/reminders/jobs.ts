export async function checkVaccineRemindersJob(_args: any, context: any) {
  const today = new Date();
  const SevenDaysAhead = new Date();
  SevenDaysAhead.setDate(today.getDate() + 7);

  // Find medical records with nextDueDate in the next 7 days without sent reminders
  const recordsNeedingReminder = await context.entities.MedicalRecord.findMany({
    where: {
      nextDueDate: {
        gte: today,
        lte: SevenDaysAhead,
      },
    },
    include: {
      pet: {
        include: { owner: true },
      },
      business: true,
      reminders: true,
    },
  });

  let createdCount = 0;

  for (const record of recordsNeedingReminder) {
    const existingPendingReminder = record.reminders.find(
      (r: any) => r.status === "PENDING"
    );

    if (!existingPendingReminder && record.nextDueDate) {
      await context.entities.Reminder.create({
        data: {
          petId: record.petId,
          medicalRecordId: record.id,
          scheduledFor: record.nextDueDate,
          status: "PENDING",
        },
      });
      createdCount++;
    }
  }

  return { processedRecords: recordsNeedingReminder.length, createdReminders: createdCount };
}
