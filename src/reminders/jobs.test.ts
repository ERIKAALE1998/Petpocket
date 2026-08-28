import { describe, it, expect, vi } from "vitest";
import { checkVaccineRemindersJob } from "./jobs.js";

describe("Reminders Cron Job", () => {
  it("should create PENDING reminders for medical records with upcoming due dates", async () => {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 3);

    const mockRecord = {
      id: "record-101",
      petId: "pet-1",
      nextDueDate: dueDate,
      reminders: [],
      pet: { owner: { email: "owner@example.com" } },
    };

    const mockCreate = vi.fn().mockResolvedValue({ id: "rem-1", status: "PENDING" });

    const mockContext = {
      entities: {
        MedicalRecord: {
          findMany: vi.fn().mockResolvedValue([mockRecord]),
        },
        Reminder: {
          create: mockCreate,
        },
      },
    };

    const result = await checkVaccineRemindersJob({}, mockContext);
    expect(result.processedRecords).toBe(1);
    expect(result.createdReminders).toBe(1);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        petId: "pet-1",
        medicalRecordId: "record-101",
        scheduledFor: dueDate,
        status: "PENDING",
      },
    });
  });

  it("should skip creating duplicate pending reminders for the same record", async () => {
    const dueDate = new Date();

    const mockRecordWithPending = {
      id: "record-102",
      petId: "pet-1",
      nextDueDate: dueDate,
      reminders: [{ id: "rem-existing", status: "PENDING" }],
      pet: { owner: { email: "owner@example.com" } },
    };

    const mockCreate = vi.fn();

    const mockContext = {
      entities: {
        MedicalRecord: {
          findMany: vi.fn().mockResolvedValue([mockRecordWithPending]),
        },
        Reminder: {
          create: mockCreate,
        },
      },
    };

    const result = await checkVaccineRemindersJob({}, mockContext);
    expect(result.createdReminders).toBe(0);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
