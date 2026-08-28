import { HttpError } from "wasp/server";
import { type GetPets, type CreatePet } from "wasp/server/operations";

export const getPets: GetPets<any, any> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "No autenticado");
  }

  const pets = await context.entities.Pet.findMany({
    where: { ownerId: context.user.id },
    include: {
      medicalRecords: {
        orderBy: { dateAdministered: "desc" },
        take: 3,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return pets;
};

type CreatePetInput = {
  name: string;
  species: "DOG" | "CAT" | "OTHER";
  breed?: string;
  birthDate?: string;
  gender: "MALE" | "FEMALE";
  microchipId?: string;
};

export const createPet: CreatePet<CreatePetInput, any> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "No autenticado");
  }

  if (!args.name || !args.species) {
    throw new HttpError(400, "Nombre y especie son obligatorios");
  }

  const pet = await context.entities.Pet.create({
    data: {
      ownerId: context.user.id,
      name: args.name,
      species: args.species,
      breed: args.breed || null,
      birthDate: args.birthDate ? new Date(args.birthDate) : null,
      gender: args.gender || "MALE",
      microchipId: args.microchipId || null,
    },
  });

  return pet;
};
