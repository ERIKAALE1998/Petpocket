export class HttpError extends Error {
  constructor(statusCode, message, data) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.name = "HttpError";
  }
}

export const env = {};
export const prisma = {};
export const config = {};
