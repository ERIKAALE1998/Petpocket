import { HttpError } from "wasp/server";
import { type GetUserReminders, type GetBusinessUpcomingReminders, type TriggerManualReminder } from "wasp/server/operations";
import { ensureUserRole } from "../shared/rbac.js";

export const getUserReminders: GetUserReminders<any, any> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "No autenticado");
  }

  const pets = await context.entities.Pet.findMany({
    where: { ownerId: context.user.id },
    select: { id: true },
  });

  const petIds = pets.map((p: any) => p.id);

  if (petIds.length === 0) {
    return [];
  }

  const reminders = await context.entities.Reminder.findMany({
    where: {
      petId: { in: petIds },
    },
    include: {
      pet: {
        select: {
          id: true,
          name: true,
          species: true,
        },
      },
      medicalRecord: {
        select: {
          id: true,
          title: true,
          recordType: true,
          nextDueDate: true,
          business: {
            select: { name: true, phone: true },
          },
        },
      },
    },
    orderBy: { scheduledFor: "asc" },
  });

  return reminders;
};

export const getBusinessUpcomingReminders: GetBusinessUpcomingReminders<any, any> = async (_args, context) => {
  ensureUserRole(context.user, ["VET_BUSINESS", "ADMIN"]);

  const business = await context.entities.Business.findUnique({
    where: { userId: context.user!.id },
  });

  if (!business && !context.user!.isAdmin) {
    return [];
  }

  const upcomingRecords = await context.entities.MedicalRecord.findMany({
    where: business
      ? {
          businessId: business.id,
          nextDueDate: { gte: new Date() },
        }
      : { nextDueDate: { gte: new Date() } },
    include: {
      pet: {
        include: {
          owner: {
            select: {
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      reminders: true,
    },
    orderBy: { nextDueDate: "asc" },
  });

  return upcomingRecords;
};

type TriggerManualReminderInput = {
  medicalRecordId: string;
};

export const triggerManualReminder: TriggerManualReminder<TriggerManualReminderInput, any> = async (args, context) => {
  ensureUserRole(context.user, ["VET_BUSINESS", "ADMIN"]);

  if (!args.medicalRecordId) {
    throw new HttpError(400, "El medicalRecordId es requerido");
  }

  const record = await context.entities.MedicalRecord.findUnique({
    where: { id: args.medicalRecordId },
    include: { pet: true },
  });

  if (!record) {
    throw new HttpError(404, "Registro médico no encontrado");
  }

  const reminder = await context.entities.Reminder.create({
    data: {
      petId: record.petId,
      medicalRecordId: record.id,
      scheduledFor: record.nextDueDate || new Date(),
      status: "SENT",
      sentAt: new Date(),
    },
  });

  return { success: true, sentAt: reminder.sentAt };
};
