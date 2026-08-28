import { describe, it, expect, vi } from "vitest";
import { becomeVetBusiness, updateUserRole } from "./operations.js";

describe("User Operations — Security & Role Management", () => {
  describe("updateUserRole", () => {
    it("should throw 401 error if user is unauthenticated", async () => {
      const mockContext = { user: null, entities: {} };
      await expect(
        updateUserRole({ userId: "target-1", role: "VET_BUSINESS" }, mockContext as any)
      ).rejects.toThrow("Debes iniciar sesión");
    });

    it("should throw 403 error if a non-admin user attempts to change a role", async () => {
      const mockContext = {
        user: { id: "user-1", role: "PET_OWNER", isAdmin: false },
        entities: {},
      };
      await expect(
        updateUserRole({ userId: "target-2", role: "VET_BUSINESS" }, mockContext as any)
      ).rejects.toThrow(/Solo los administradores tienen permiso/);
    });

    it("should throw 400 error if an admin tries to change their own role", async () => {
      const mockContext = {
        user: { id: "admin-1", role: "ADMIN", isAdmin: true },
        entities: {},
      };
      await expect(
        updateUserRole({ userId: "admin-1", role: "PET_OWNER" }, mockContext as any)
      ).rejects.toThrow(/No puedes modificar tu propio rol/);
    });

    it("should throw 400 error for an invalid role", async () => {
      const mockContext = {
        user: { id: "admin-1", role: "ADMIN", isAdmin: true },
        entities: {},
      };
      await expect(
        updateUserRole({ userId: "user-2", role: "SUPERMAN" as any }, mockContext as any)
      ).rejects.toThrow(/Rol inválido/);
    });

    it("should allow an ADMIN to update another user's role", async () => {
      const mockUpdate = vi.fn().mockResolvedValue({ id: "user-2", role: "VET_BUSINESS" });
      const mockContext = {
        user: { id: "admin-1", role: "ADMIN", isAdmin: true },
        entities: {
          User: {
            update: mockUpdate,
          },
        },
      };

      const result = await updateUserRole(
        { userId: "user-2", role: "VET_BUSINESS" },
        mockContext as any
      );

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "user-2" },
        data: { role: "VET_BUSINESS" },
      });
      expect(result.role).toBe("VET_BUSINESS");
    });
  });

  describe("becomeVetBusiness", () => {
    it("should update user role to VET_BUSINESS and upsert business entity", async () => {
      const mockUserUpdate = vi.fn().mockResolvedValue({ id: "user-vet-1", role: "VET_BUSINESS" });
      const mockBusinessUpsert = vi.fn().mockResolvedValue({
        id: "biz-1",
        userId: "user-vet-1",
        name: "Veterinaria San Francisco",
        address: "Av. Shyris N34",
        latitude: -0.1807,
        longitude: -78.4678,
        phone: "0998765432",
      });

      const mockContext = {
        user: { id: "user-vet-1" },
        entities: {
          User: {
            update: mockUserUpdate,
          },
          Business: {
            upsert: mockBusinessUpsert,
          },
        },
      };

      const input = {
        name: "Veterinaria San Francisco",
        address: "Av. Shyris N34",
        latitude: -0.1807,
        longitude: -78.4678,
        phone: "0998765432",
      };

      const result = await becomeVetBusiness(input, mockContext as any);

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: "user-vet-1" },
        data: { role: "VET_BUSINESS" },
      });

      expect(mockBusinessUpsert).toHaveBeenCalledWith({
        where: { userId: "user-vet-1" },
        update: {
          name: "Veterinaria San Francisco",
          description: null,
          address: "Av. Shyris N34",
          latitude: -0.1807,
          longitude: -78.4678,
          phone: "0998765432",
          workingHours: {},
        },
        create: {
          userId: "user-vet-1",
          name: "Veterinaria San Francisco",
          description: null,
          address: "Av. Shyris N34",
          latitude: -0.1807,
          longitude: -78.4678,
          phone: "0998765432",
          workingHours: {},
        },
      });

      expect(result.user.role).toBe("VET_BUSINESS");
      expect(result.business.name).toBe("Veterinaria San Francisco");
    });
  });
});
