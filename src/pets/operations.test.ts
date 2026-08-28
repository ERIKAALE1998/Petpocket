import { describe, it, expect, vi } from "vitest";
import { getPets, createPet } from "./operations.js";

describe("Pet CRUD Operations", () => {
  it("should disallow getPets for an unauthenticated user", async () => {
    const mockContext = {
      user: null,
      entities: {},
    };

    await expect(getPets({}, mockContext as any)).rejects.toThrow(/No autenticado/);
  });

  it("should only return pets belonging to the authenticated owner", async () => {
    const mockPets = [
      { id: "pet-1", name: "Firulais", ownerId: "owner-1", medicalRecords: [] },
    ];

    const mockFindMany = vi.fn().mockResolvedValue(mockPets);

    const mockContext = {
      user: { id: "owner-1", role: "PET_OWNER", isAdmin: false },
      entities: {
        Pet: {
          findMany: mockFindMany,
        },
      },
    };

    const pets = await getPets({}, mockContext as any);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerId: "owner-1" },
      })
    );
    expect(pets).toEqual(mockPets);
  });

  it("should disallow createPet for an unauthenticated user", async () => {
    const mockContext = {
      user: null,
      entities: {},
    };

    await expect(
      createPet(
        { name: "Firulais", species: "DOG", gender: "MALE" },
        mockContext as any
      )
    ).rejects.toThrow(/No autenticado/);
  });

  it("should reject createPet when required fields are missing", async () => {
    const mockContext = {
      user: { id: "owner-1", role: "PET_OWNER", isAdmin: false },
      entities: {
        Pet: { create: vi.fn() },
      },
    };

    await expect(
      createPet({ name: "", species: undefined, gender: "MALE" } as any, mockContext as any)
    ).rejects.toThrow(/obligatorios/);
  });

  it("should create a pet owned by the authenticated user", async () => {
    const mockCreate = vi.fn().mockResolvedValue({
      id: "pet-1",
      ownerId: "owner-1",
      name: "Firulais",
      species: "DOG",
      gender: "MALE",
    });

    const mockContext = {
      user: { id: "owner-1", role: "PET_OWNER", isAdmin: false },
      entities: {
        Pet: {
          create: mockCreate,
        },
      },
    };

    const pet = await createPet(
      { name: "Firulais", species: "DOG", gender: "MALE" },
      mockContext as any
    );

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ownerId: "owner-1",
          name: "Firulais",
          species: "DOG",
          gender: "MALE",
        }),
      })
    );
    expect(pet.id).toBe("pet-1");
  });
});
