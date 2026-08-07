import { HttpError } from "wasp/server";
import { type AddMedicalRecord, type GetPetMedicalHistory, type GetBusinessMedicalRecords } from "wasp/server/operations";
import { ensureUserRole } from "../shared/rbac.js";

type AddMedicalRecordInput = {
  petId: string;
  recordType: "VACCINE" | "DEWORMING" | "CONSULTATION" | "SURGERY";
  title: string;
  description?: string;
  dateAdministered?: string;
  nextDueDate?: string;
};

export const addMedicalRecord: AddMedicalRecord<AddMedicalRecordInput, any> = async (args, context) => {
  ensureUserRole(context.user, ["VET_BUSINESS", "ADMIN"]);

  if (!args.petId || !args.title || !args.recordType) {
    throw new HttpError(400, "Los campos petId, title y recordType son obligatorios");
  }

  // Find business profile of the current vet user
  const business = await context.entities.Business.findUnique({
    where: { userId: context.user!.id },
  });

  if (!business && !context.user!.isAdmin) {
    throw new HttpError(400, "Debe configurar su perfil veterinario antes de registrar atenciones");
  }

  const pet = await context.entities.Pet.findUnique({
    where: { id: args.petId },
  });

  if (!pet) {
    throw new HttpError(404, "Mascota no encontrada");
  }

  const record = await context.entities.MedicalRecord.create({
    data: {
      petId: args.petId,
      businessId: business?.id ?? null,
      recordType: args.recordType,
      title: args.title,
      description: args.description || null,
      dateAdministered: args.dateAdministered ? new Date(args.dateAdministered) : new Date(),
      nextDueDate: args.nextDueDate ? new Date(args.nextDueDate) : null,
    },
    include: {
      pet: true,
      business: true,
    },
  });

  return record;
};

type GetPetMedicalHistoryInput = {
  petId: string;
};

export const getPetMedicalHistory: GetPetMedicalHistory<GetPetMedicalHistoryInput, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "No autenticado");
  }

  if (!args.petId) {
    throw new HttpError(400, "El petId es obligatorio");
  }

  const pet = await context.entities.Pet.findUnique({
    where: { id: args.petId },
    include: { owner: true },
  });

  if (!pet) {
    throw new HttpError(404, "Mascota no encontrada");
  }

  // RBAC Check: User must own the pet OR be a VET_BUSINESS/ADMIN
  const isOwner = pet.ownerId === context.user.id;
  const isVet = context.user.role === "VET_BUSINESS" || context.user.isAdmin;

  if (!isOwner && !isVet) {
    throw new HttpError(403, "No tiene permiso para consultar el historial médico de esta mascota");
  }

  const records = await context.entities.MedicalRecord.findMany({
    where: { petId: args.petId },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
    orderBy: { dateAdministered: "desc" },
  });

  return {
    petId: pet.id,
    petName: pet.name,
    species: pet.species,
    breed: pet.breed,
    ownerName: pet.owner.fullName || pet.owner.username || pet.owner.email,
    records,
  };
};

export const getBusinessMedicalRecords: GetBusinessMedicalRecords<any, any> = async (args, context) => {
  ensureUserRole(context.user, ["VET_BUSINESS", "ADMIN"]);

  const business = await context.entities.Business.findUnique({
    where: { userId: context.user!.id },
  });

  if (!business && !context.user!.isAdmin) {
    return [];
  }

  const records = await context.entities.MedicalRecord.findMany({
    where: business ? { businessId: business.id } : {},
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
    },
    orderBy: { dateAdministered: "desc" },
  });

  return records;
};
