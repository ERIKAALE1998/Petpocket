import { describe, it, expect, beforeEach, vi } from "vitest";
import { addMedicalRecord, getPetMedicalHistory } from "./operations.js";

describe("Medical Records Operations", () => {
  it("should disallow non-vet users from adding medical records", async () => {
    const mockContext = {
      user: { id: "user-1", role: "PET_OWNER", isAdmin: false },
      entities: {},
    };

    await expect(
      addMedicalRecord(
        {
          petId: "pet-1",
          recordType: "VACCINE",
          title: "Vacuna Antirrábica",
        },
        mockContext as any
      )
    ).rejects.toThrow(/Acceso denegado/);
  });

  it("should allow vet users to add medical records with nextDueDate", async () => {
    const mockBusiness = { id: "biz-1", userId: "vet-1", name: "Helpet Clinic" };
    const mockPet = { id: "pet-1", name: "Firulais", ownerId: "owner-1" };

    const mockCreate = vi.fn().mockResolvedValue({
      id: "record-1",
      petId: "pet-1",
      businessId: "biz-1",
      recordType: "VACCINE",
      title: "Vacuna Quíntuple",
      nextDueDate: new Date("2026-09-01"),
    });

    const mockContext = {
      user: { id: "vet-1", role: "VET_BUSINESS", isAdmin: false },
      entities: {
        Business: {
          findUnique: vi.fn().mockResolvedValue(mockBusiness),
        },
        Pet: {
          findUnique: vi.fn().mockResolvedValue(mockPet),
        },
        MedicalRecord: {
          create: mockCreate,
        },
      },
    };

    const result = await addMedicalRecord(
      {
        petId: "pet-1",
        recordType: "VACCINE",
        title: "Vacuna Quíntuple",
        nextDueDate: "2026-09-01",
      },
      mockContext as any
    );

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          petId: "pet-1",
          recordType: "VACCINE",
          title: "Vacuna Quíntuple",
          nextDueDate: new Date("2026-09-01"),
        }),
      })
    );
    expect(result.id).toBe("record-1");
  });

  it("should allow pet owner to query their pet medical history in read-only mode", async () => {
    const mockPet = {
      id: "pet-1",
      name: "Firulais",
      species: "DOG",
      breed: "Poodle",
      ownerId: "owner-1",
      owner: { fullName: "Isaac" },
    };

    const mockRecords = [
      {
        id: "rec-1",
        recordType: "VACCINE",
        title: "Vacuna Parvovirus",
        dateAdministered: new Date("2026-08-01"),
        nextDueDate: new Date("2026-09-01"),
        business: { id: "biz-1", name: "Helpet Clinic", phone: "099123456" },
      },
    ];

    const mockContext = {
      user: { id: "owner-1", role: "PET_OWNER", isAdmin: false },
      entities: {
        Pet: {
          findUnique: vi.fn().mockResolvedValue(mockPet),
        },
        MedicalRecord: {
          findMany: vi.fn().mockResolvedValue(mockRecords),
        },
      },
    };

    const history = await getPetMedicalHistory({ petId: "pet-1" }, mockContext as any);
    expect(history.petName).toBe("Firulais");
    expect(history.records.length).toBe(1);
    expect(history.records[0].title).toBe("Vacuna Parvovirus");
  });

  it("should disallow a pet owner from viewing another owner's pet medical history", async () => {
    const mockPet = {
      id: "pet-1",
      name: "Firulais",
      species: "DOG",
      breed: "Poodle",
      ownerId: "owner-1",
      owner: { fullName: "Isaac" },
    };

    const mockContext = {
      user: { id: "owner-2", role: "PET_OWNER", isAdmin: false },
      entities: {
        Pet: {
          findUnique: vi.fn().mockResolvedValue(mockPet),
        },
        MedicalRecord: {
          findMany: vi.fn(),
        },
      },
    };

    await expect(
      getPetMedicalHistory({ petId: "pet-1" }, mockContext as any)
    ).rejects.toThrow(/No tiene permiso/);

    expect(mockContext.entities.MedicalRecord.findMany).not.toHaveBeenCalled();
  });

  it("should allow a vet business user to view any pet's medical history regardless of ownership", async () => {
    const mockPet = {
      id: "pet-1",
      name: "Firulais",
      species: "DOG",
      breed: "Poodle",
      ownerId: "owner-1",
      owner: { fullName: "Isaac" },
    };

    const mockRecords = [
      {
        id: "rec-1",
        recordType: "VACCINE",
        title: "Vacuna Parvovirus",
        dateAdministered: new Date("2026-08-01"),
        nextDueDate: new Date("2026-09-01"),
        business: { id: "biz-1", name: "Helpet Clinic", phone: "099123456" },
      },
    ];

    const mockContext = {
      user: { id: "vet-1", role: "VET_BUSINESS", isAdmin: false },
      entities: {
        Pet: {
          findUnique: vi.fn().mockResolvedValue(mockPet),
        },
        MedicalRecord: {
          findMany: vi.fn().mockResolvedValue(mockRecords),
        },
      },
    };

    const history = await getPetMedicalHistory({ petId: "pet-1" }, mockContext as any);
    expect(history.records.length).toBe(1);
  });
});
