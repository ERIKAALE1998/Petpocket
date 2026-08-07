import { HttpError } from "wasp/server";
import {
  type GetUserReminders,
  type GetBusinessUpcomingReminders,
  type TriggerManualReminder,
  type GetReminders,
  type CreateReminder,
  type ToggleReminderStatus,
} from "wasp/server/operations";
import { ensureUserRole } from "../shared/rbac.js";

type GetRemindersInput = void;

export const getReminders: GetReminders<GetRemindersInput, any> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "No autenticado");
  }

  const reminders = await context.entities.Reminder.findMany({
    where: {
      userId: context.user.id,
    },
    include: {
      pet: true,
      medicalRecord: true,
    },
    orderBy: { dueDate: "asc" },
  });

  return reminders;
};

type CreateReminderInput = {
  petId: string;
  title: string;
  description?: string;
  dueDate: string;
  recurring?: boolean;
  intervalDays?: number;
};

export const createReminder: CreateReminder<CreateReminderInput, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "No autenticado");
  }

  if (!args.petId || !args.title || !args.dueDate) {
    throw new HttpError(400, "Los campos petId, title y dueDate son requeridos.");
  }

  const pet = await context.entities.Pet.findUnique({
    where: { id: args.petId },
  });

  if (!pet) {
    throw new HttpError(404, "Mascota no encontrada");
  }

  const reminder = await context.entities.Reminder.create({
    data: {
      title: args.title.trim(),
      description: args.description?.trim() || null,
      dueDate: new Date(args.dueDate),
      recurring: args.recurring ?? false,
      intervalDays: args.intervalDays || null,
      status: "PENDING",
      petId: args.petId,
      userId: context.user.id,
    },
    include: {
      pet: true,
    },
  });

  return reminder;
};

type ToggleReminderStatusInput = {
  reminderId: string;
  status?: "PENDING" | "COMPLETED" | "CANCELLED";
};

export const toggleReminderStatus: ToggleReminderStatus<ToggleReminderStatusInput, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "No autenticado");
  }

  const reminder = await context.entities.Reminder.findUnique({
    where: { id: args.reminderId },
  });

  if (!reminder) {
    throw new HttpError(404, "Recordatorio no encontrado");
  }

  const newStatus = args.status || (reminder.status === "COMPLETED" ? "PENDING" : "COMPLETED");

  const updatedReminder = await context.entities.Reminder.update({
    where: { id: args.reminderId },
    data: {
      status: newStatus,
    },
  });

  return updatedReminder;
};

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
    orderBy: { dueDate: "asc" },
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
      title: record.title,
      dueDate: record.nextDueDate || new Date(),
      petId: record.petId,
      userId: context.user!.id,
      medicalRecordId: record.id,
      status: "SENT",
      sentAt: new Date(),
    },
  });

  return { success: true, sentAt: reminder.sentAt };
};
