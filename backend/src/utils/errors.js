export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const notFound = (resource = "Resource") =>
  new AppError(`${resource} not found`, 404);

export const forbidden = () => new AppError("Accès refusé", 403);

export const unauthorized = () => new AppError("Non authentifié", 401);

export function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";

  if (process.env.NODE_ENV !== "production") {
    console.error(`[${status}] ${message}`, err.stack);
  }

  res.status(status).json({ error: message });
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
