export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class CSVError extends AppError {
  constructor(message: string) {
    super(`CSV Error: ${message}`, 500);
  }
}

export class APIError extends AppError {
  constructor(message: string, statusCode = 500) {
    super(`API Error: ${message}`, statusCode);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(`Database Error: ${message}`, 500);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(`Validation Error: ${message}`, 400);
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return new AppError(message, 500);
}

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`Error in operation: ${errorMessage}`, error);
    throw handleError(error);
  }
}

export function isNotFound(error: unknown): boolean {
  return error instanceof AppError && error.statusCode === 404;
}

export function formatErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
