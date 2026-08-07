export class HttpError extends Error {
  statusCode: number;
  data: any;
  constructor(statusCode: number, message?: string, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.name = "HttpError";
  }
}
export const prisma = {};
export const config = {};
export const env = {};
