export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class CacheError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CacheError';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isCacheError(error: unknown): error is CacheError {
  return error instanceof CacheError;
}

export function handleApiError(error: unknown): never {
  if (isApiError(error)) {
    throw error;
  }
  
  if (error instanceof Error) {
    throw new ApiError(error.message, 500);
  }
  
  throw new ApiError('An unexpected error occurred', 500);
}

export function formatErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return `Error ${error.statusCode}: ${error.message}`;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}
