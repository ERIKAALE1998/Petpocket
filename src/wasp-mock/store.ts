import React, { useState, useEffect } from "react";

export interface PetItem {
  id: string;
  name: string;
  species: string;
  breed?: string | null;
  gender: string;
  birthDate?: string | null;
  createdAt: string;
}

export interface MedicalRecordItem {
  id: string;
  petId: string;
  recordType: string;
  title: string;
  description?: string | null;
  dateAdministered: string;
  nextDueDate?: string | null;
  business?: { id: string; name: string } | null;
}

export interface UserItem {
  id: string;
  email: string;
  fullName: string;
  username: string;
  role: "VET_BUSINESS" | "PET_OWNER" | "ADMIN";
  isAdmin: boolean;
}

const initialPets: PetItem[] = [
  {
    id: "pet-1",
    name: "Firulais",
    species: "DOG",
    breed: "Golden Retriever",
    gender: "MALE",
    birthDate: "2022-05-10",
    createdAt: new Date().toISOString(),
  },
  {
    id: "pet-2",
    name: "Michi",
    species: "CAT",
    breed: "Siamés",
    gender: "FEMALE",
    birthDate: "2023-01-15",
    createdAt: new Date().toISOString(),
  },
];

const initialRecords: MedicalRecordItem[] = [
  {
    id: "rec-1",
    petId: "pet-1",
    recordType: "VACCINE",
    title: "Vacuna Antirrábica y Séxtuple",
    description: "Aplicación de dosis anual completa. Estado físico excelente.",
    dateAdministered: "2026-06-15",
    nextDueDate: "2027-06-15",
    business: { id: "biz-1", name: "Clínica Veterinaria Helpet" },
  },
  {
    id: "rec-2",
    petId: "pet-1",
    recordType: "DEWORMING",
    title: "Desparasitación Interna (Bravecto)",
    description: "Dosis oral preventiva según peso corporal actual (28kg).",
    dateAdministered: "2026-07-01",
    nextDueDate: "2026-10-01",
    business: { id: "biz-1", name: "Clínica Veterinaria Helpet" },
  },
];

let petsStore: PetItem[] = [...initialPets];
let recordsStore: MedicalRecordItem[] = [...initialRecords];
let currentUser: UserItem = {
  id: "user-1",
  email: "veterinaria.helpet@petpocket.app",
  fullName: "Dra. Valeria Gómez (Helpet)",
  username: "valeria_vet",
  role: "VET_BUSINESS",
  isAdmin: false,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const mockStore = {
  getPets: () => [...petsStore],
  createPet: (data: Omit<PetItem, "id" | "createdAt">) => {
    const newPet: PetItem = {
      ...data,
      id: `pet-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    petsStore = [newPet, ...petsStore];
    notify();
    return newPet;
  },
  getMedicalHistory: (petId: string) => {
    const pet = petsStore.find((p) => p.id === petId);
    if (!pet) throw new Error("Mascota no encontrada");
    const records = recordsStore.filter((r) => r.petId === petId);
    return {
      petId: pet.id,
      petName: pet.name,
      species: pet.species,
      breed: pet.breed,
      ownerName: currentUser.fullName,
      records,
    };
  },
  addMedicalRecord: (data: Omit<MedicalRecordItem, "id">) => {
    const newRecord: MedicalRecordItem = {
      ...data,
      id: `rec-${Date.now()}`,
      business: { id: "biz-1", name: "Clínica Veterinaria Helpet" },
    };
    recordsStore = [newRecord, ...recordsStore];
    notify();
    return newRecord;
  },
  getUser: () => currentUser,
  setUserRole: (role: "VET_BUSINESS" | "PET_OWNER") => {
    currentUser = {
      ...currentUser,
      role,
      fullName: role === "VET_BUSINESS" ? "Dra. Valeria Gómez (Veterinaria)" : "Carlos Pérez (Dueño de Mascota)",
    };
    notify();
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
