import { HttpError } from "wasp/server";

export type UserRole = "PET_OWNER" | "VET_BUSINESS" | "ADMIN";

export interface UserAuthContext {
  id: string;
  role?: string | null;
  isAdmin?: boolean | null;
}

/**
 * Ensures that the authenticated user has one of the specified allowed roles.
 * Throws HttpError(401) if not logged in, or HttpError(403) if role is insufficient.
 */
export function ensureUserRole(
  user: UserAuthContext | undefined,
  allowedRoles: UserRole[]
): void {
  if (!user) {
    throw new HttpError(401, "Usuario no autenticado");
  }

  const role = (user.role as UserRole) || "PET_OWNER";

  if (user.isAdmin) {
    return; // Admin bypass
  }

  if (!allowedRoles.includes(role)) {
    throw new HttpError(
      403,
      `Acceso denegado: Se requiere rol ${allowedRoles.join(" o ")}`
    );
  }
}

/**
 * Helper to check if a user is a registered veterinary business or admin.
 */
export function isVetBusiness(user: UserAuthContext | undefined): boolean {
  if (!user) return false;
  return user.role === "VET_BUSINESS" || user.isAdmin === true;
}

/**
 * Helper to check if a user is a pet owner.
 */
export function isPetOwner(user: UserAuthContext | undefined): boolean {
  if (!user) return false;
  return user.role === "PET_OWNER" || user.isAdmin === true;
}
