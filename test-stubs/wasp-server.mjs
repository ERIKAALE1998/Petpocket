import { vi } from "vitest";

export class HttpError extends Error {
  constructor(statusCode, message, data) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.name = "HttpError";
  }
}

export const env = {};
export const prisma = {
  $queryRaw: vi.fn().mockResolvedValue([]),
};
export const config = {};
