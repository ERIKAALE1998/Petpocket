import { useState, useEffect, useCallback } from "react";
import { mockStore } from "../store";

export const getPets = async () => {
  return mockStore.getPets();
};

export const createPet = async (args: any) => {
  return mockStore.createPet(args);
};

export const getPetMedicalHistory = async (args: { petId: string }) => {
  if (!args?.petId) {
    throw new Error("El petId es obligatorio");
  }
  return mockStore.getMedicalHistory(args.petId);
};

export const addMedicalRecord = async (args: any) => {
  return mockStore.addMedicalRecord(args);
};

export const getUserReminders = async () => {
  return [
    {
      id: "rem-1",
      scheduledFor: "2026-10-01",
      status: "PENDING",
      pet: { name: "Firulais" },
      medicalRecord: {
        title: "Desparasitación Interna (Bravecto)",
        business: { name: "Clínica Veterinaria Helpet" },
      },
    },
    {
      id: "rem-2",
      scheduledFor: "2027-06-15",
      status: "PENDING",
      pet: { name: "Firulais" },
      medicalRecord: {
        title: "Vacuna Antirrábica y Séxtuple",
        business: { name: "Clínica Veterinaria Helpet" },
      },
    },
  ];
};

export function useQuery<T>(
  queryFn: (args: any) => Promise<T>,
  args?: any,
  options?: { enabled?: boolean }
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const enabled = options?.enabled !== false;

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await queryFn(args);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [queryFn, JSON.stringify(args), enabled]);

  useEffect(() => {
    fetchData();
    const unsubscribe = mockStore.subscribe(() => {
      fetchData();
    });
    return unsubscribe;
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useAction<TInput, TOutput>(
  actionFn: (args: TInput) => Promise<TOutput>
) {
  return useCallback(
    async (args: TInput) => {
      return await actionFn(args);
    },
    [actionFn]
  );
}
