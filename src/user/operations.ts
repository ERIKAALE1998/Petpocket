import { type Prisma } from "@prisma/client";
import { type User } from "wasp/entities";
import { HttpError, prisma } from "wasp/server";
import {
  type GetPaginatedUsers,
  type UpdateIsUserAdminById,
} from "wasp/server/operations";
import * as z from "zod";
import { SubscriptionStatus } from "../payment/plans";
import { ensureArgsSchemaOrThrowHttpError } from "../server/validation";

const updateUserAdminByIdInputSchema = z.object({
  id: z.string().nonempty(),
  isAdmin: z.boolean(),
});

type UpdateUserAdminByIdInput = z.infer<typeof updateUserAdminByIdInputSchema>;

export const updateIsUserAdminById: UpdateIsUserAdminById<
  UpdateUserAdminByIdInput,
  User
> = async (rawArgs, context) => {
  const { id, isAdmin } = ensureArgsSchemaOrThrowHttpError(
    updateUserAdminByIdInputSchema,
    rawArgs,
  );

  if (!context.user) {
    throw new HttpError(
      401,
      "Only authenticated users are allowed to perform this operation",
    );
  }

  if (!context.user.isAdmin) {
    throw new HttpError(
      403,
      "Only admins are allowed to perform this operation",
    );
  }

  return context.entities.User.update({
    where: { id },
    data: { isAdmin },
  });
};

type GetPaginatedUsersOutput = {
  users: Pick<
    User,
    | "id"
    | "email"
    | "username"
    | "subscriptionStatus"
    | "paymentProcessorUserId"
    | "isAdmin"
  >[];
  totalPages: number;
};

const getPaginatorArgsSchema = z.object({
  skipPages: z.number(),
  filter: z.object({
    emailContains: z.string().nonempty().optional(),
    isAdmin: z.boolean().optional(),
    subscriptionStatusIn: z
      .array(z.nativeEnum(SubscriptionStatus).nullable())
      .optional(),
  }),
});

type GetPaginatedUsersInput = z.infer<typeof getPaginatorArgsSchema>;

export const getPaginatedUsers: GetPaginatedUsers<
  GetPaginatedUsersInput,
  GetPaginatedUsersOutput
> = async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(
      401,
      "Only authenticated users are allowed to perform this operation",
    );
  }

  if (!context.user.isAdmin) {
    throw new HttpError(
      403,
      "Only admins are allowed to perform this operation",
    );
  }

  const {
    skipPages,
    filter: {
      subscriptionStatusIn: subscriptionStatus,
      emailContains,
      isAdmin,
    },
  } = ensureArgsSchemaOrThrowHttpError(getPaginatorArgsSchema, rawArgs);

  const includeUnsubscribedUsers = !!subscriptionStatus?.some(
    (status) => status === null,
  );
  const desiredSubscriptionStatuses = subscriptionStatus?.filter(
    (status) => status !== null,
  );

  const pageSize = 10;

  const userPageQuery: Prisma.UserFindManyArgs = {
    skip: skipPages * pageSize,
    take: pageSize,
    where: {
      AND: [
        {
          email: {
            contains: emailContains,
            mode: "insensitive",
          },
          isAdmin,
        },
        {
          OR: [
            {
              subscriptionStatus: {
                in: desiredSubscriptionStatuses,
              },
            },
            {
              subscriptionStatus: includeUnsubscribedUsers ? null : undefined,
            },
          ],
        },
      ],
    },
    select: {
      id: true,
      email: true,
      username: true,
      isAdmin: true,
      subscriptionStatus: true,
      paymentProcessorUserId: true,
    },
    orderBy: {
      username: "asc",
    },
  };

  const [pageOfUsers, totalUsers] = await prisma.$transaction([
    context.entities.User.findMany(userPageQuery),
    context.entities.User.count({ where: userPageQuery.where }),
  ]);
  const totalPages = Math.ceil(totalUsers / pageSize);

  return {
    users: pageOfUsers,
    totalPages,
  };
};

// --- LÓGICA PARA RECONOCER Y REGISTRAR USUARIOS COMO VETERINARIA EN LA BD ---

export type UpdateUserRoleInput = {
  userId: string;
  role: "PET_OWNER" | "VET_BUSINESS" | "ADMIN";
};

export type BecomeVetBusinessInput = {
  name?: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  workingHours?: any;
};

/**
 * Actualiza el rol de OTRO usuario en la base de datos (User.role).
 * Requiere permisos de administrador (ADMIN / isAdmin: true).
 */
export const updateUserRole = async (
  args: UpdateUserRoleInput,
  context: any
) => {
  if (!context.user) {
    throw new HttpError(
      401,
      "Debes iniciar sesión para realizar esta operación"
    );
  }

  // Solo un usuario administrador puede cambiar el rol de un usuario
  const isUserAdmin = context.user.isAdmin || context.user.role === "ADMIN";
  if (!isUserAdmin) {
    throw new HttpError(
      403,
      "Solo los administradores tienen permiso para cambiar el rol de un usuario"
    );
  }

  if (!args.userId) {
    throw new HttpError(
      400,
      "El ID del usuario objetivo (userId) es obligatorio"
    );
  }

  // Prevenir que el admin modifique su propio rol mediante esta función
  if (args.userId === context.user.id) {
    throw new HttpError(
      400,
      "No puedes modificar tu propio rol. Esta función está destinada únicamente a cambiar el rol de otros usuarios"
    );
  }

  const validRoles = ["PET_OWNER", "VET_BUSINESS", "ADMIN"];
  if (!validRoles.includes(args.role)) {
    throw new HttpError(
      400,
      "Rol inválido. Roles permitidos: PET_OWNER, VET_BUSINESS, ADMIN"
    );
  }

  return context.entities.User.update({
    where: { id: args.userId },
    data: { role: args.role },
  });
};

/**
 * Registra y reconoce a un usuario como Veterinaria (VET_BUSINESS) en la base de datos.
 * Actualiza el campo `role` en la entidad `User` a 'VET_BUSINESS' y, si se proporcionan datos de clínica/negocio,
 * crea o actualiza la entidad `Business` conectada mediante la clave foránea `userId`.
 */
export const becomeVetBusiness = async (
  args: BecomeVetBusinessInput,
  context: any
) => {
  if (!context.user) {
    throw new HttpError(
      401,
      "Debes iniciar sesión para registrar tu veterinaria"
    );
  }

  // 1. Actualizar la entidad User en el esquema Prisma (role -> VET_BUSINESS)
  const updatedUser = await context.entities.User.update({
    where: { id: context.user.id },
    data: { role: "VET_BUSINESS" },
  });

  // 2. Si se suministran datos del establecimiento, crear o actualizar la entidad Business
  let business = null;
  if (
    args.name &&
    args.address &&
    typeof args.latitude === "number" &&
    typeof args.longitude === "number"
  ) {
    business = await context.entities.Business.upsert({
      where: { userId: context.user.id },
      update: {
        name: args.name,
        description: args.description || null,
        address: args.address,
        latitude: args.latitude,
        longitude: args.longitude,
        phone: args.phone || "",
        workingHours: args.workingHours || {},
      },
      create: {
        userId: context.user.id,
        name: args.name,
        description: args.description || null,
        address: args.address,
        latitude: args.latitude,
        longitude: args.longitude,
        phone: args.phone || "",
        workingHours: args.workingHours || {},
      },
    });
  } else if (context.entities.Business) {
    business = await context.entities.Business.findUnique({
      where: { userId: context.user.id },
    });
  }

  return {
    user: updatedUser,
    business,
  };
};