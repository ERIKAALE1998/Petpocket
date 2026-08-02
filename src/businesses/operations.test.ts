import { describe, it, expect, vi } from "vitest";
import { searchNearbyBusinesses, updateBusinessProfile } from "./operations.js";

describe("Businesses Operations", () => {
  it("should calculate nearby clinics using Haversine raw query", async () => {
    const mockBusinesses = [
      {
        id: "biz-1",
        name: "Helpet Clinic",
        address: "Av. Amazonas y Colón",
        phone: "099123456",
        latitude: -0.1807,
        longitude: -78.4678,
        distanceKm: 1.2,
      },
    ];

    const mockQueryRaw = vi.fn().mockResolvedValue(mockBusinesses);

    const mockContext = {
      entities: {
        Business: {
          prismaApp: {
            $queryRaw: mockQueryRaw,
          },
        },
      },
    };

    const results = await searchNearbyBusinesses(
      { latitude: -0.1807, longitude: -78.4678, radiusKm: 10 },
      mockContext as any
    );

    expect(results.length).toBe(1);
    expect(results[0].name).toBe("Helpet Clinic");
    expect(results[0].distanceKm).toBe(1.2);
  });

  it("should disallow non-vet users from updating business profiles", async () => {
    const mockContext = {
      user: { id: "owner-1", role: "PET_OWNER", isAdmin: false },
      entities: {},
    };

    await expect(
      updateBusinessProfile(
        {
          name: "Fake Clinic",
          address: "123 Main St",
          latitude: 0,
          longitude: 0,
          phone: "123456",
        },
        mockContext as any
      )
    ).rejects.toThrow(/Acceso denegado/);
  });
});
