import { HttpError } from "wasp/server";
import { type SearchNearbyBusinesses, type GetBusinessProfile, type UpdateBusinessProfile } from "wasp/server/operations";
import { ensureUserRole } from "../shared/rbac.js";

type SearchNearbyInput = {
  latitude: number;
  longitude: number;
  radiusKm?: number;
};

export const searchNearbyBusinesses: SearchNearbyBusinesses<SearchNearbyInput, any> = async (args, context) => {
  if (typeof args.latitude !== "number" || typeof args.longitude !== "number") {
    throw new HttpError(400, "Las coordenadas latitude y longitude son requeridas");
  }

  const radiusKm = args.radiusKm || 10;
  const userLat = args.latitude;
  const userLng = args.longitude;

  // PostgreSQL Haversine distance formula calculation via Prisma raw SQL
  const result: any[] = await context.entities.Business.prismaApp.$queryRaw`
    SELECT 
      id, 
      name, 
      description, 
      address, 
      phone, 
      latitude, 
      longitude, 
      "workingHours",
      (
        6371 * acos(
          cos(radians(${userLat})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${userLng})) +
          sin(radians(${userLat})) * sin(radians(latitude))
        )
      ) AS "distanceKm"
    FROM "Business"
    WHERE (
      6371 * acos(
        cos(radians(${userLat})) * cos(radians(latitude)) *
        cos(radians(longitude) - radians(${userLng})) +
        sin(radians(${userLat})) * sin(radians(latitude))
      )
    ) <= ${radiusKm}
    ORDER BY "distanceKm" ASC;
  `;

  return result.map((b) => ({
    ...b,
    distanceKm: Math.round(Number(b.distanceKm) * 10) / 10,
  }));
};

type GetBusinessProfileInput = {
  businessId?: string;
};

export const getBusinessProfile: GetBusinessProfile<GetBusinessProfileInput, any> = async (args, context) => {
  let business;

  if (args.businessId) {
    business = await context.entities.Business.findUnique({
      where: { id: args.businessId },
    });
  } else if (context.user) {
    business = await context.entities.Business.findUnique({
      where: { userId: context.user.id },
    });
  }

  return business || null;
};

type UpdateBusinessProfileInput = {
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  workingHours?: any;
};

export const updateBusinessProfile: UpdateBusinessProfile<UpdateBusinessProfileInput, any> = async (args, context) => {
  ensureUserRole(context.user, ["VET_BUSINESS", "ADMIN"]);

  if (!args.name || !args.address || typeof args.latitude !== "number" || typeof args.longitude !== "number") {
    throw new HttpError(400, "Nombre, dirección y coordenadas (lat, lng) son obligatorios");
  }

  const business = await context.entities.Business.upsert({
    where: { userId: context.user!.id },
    update: {
      name: args.name,
      description: args.description || null,
      address: args.address,
      latitude: args.latitude,
      longitude: args.longitude,
      phone: args.phone,
      workingHours: args.workingHours || {},
    },
    create: {
      userId: context.user!.id,
      name: args.name,
      description: args.description || null,
      address: args.address,
      latitude: args.latitude,
      longitude: args.longitude,
      phone: args.phone,
      workingHours: args.workingHours || {},
    },
  });

  return business;
};
