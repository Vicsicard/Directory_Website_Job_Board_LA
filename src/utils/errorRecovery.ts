import { ApiError } from './errorUtils';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponential?: boolean;
  shouldRetry?: (error: any) => boolean;
}

export interface FallbackConfig<T> {
  defaultValue?: T;
  fallbackFn?: () => Promise<T>;
  onFallback?: (error: any) => void;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  exponential: true,
  shouldRetry: (error: any) => {
    if (error instanceof ApiError) {
      // Retry on specific API errors
      return [
        'PLACES_API_QUOTA_ERROR',
        'PLACES_API_NETWORK_ERROR',
        'MONGODB_CONNECTION_ERROR'
      ].includes(error.code);
    }
    // Retry on network errors or 5xx server errors
    return error.name === 'NetworkError' || (error.status >= 500 && error.status < 600);
  }
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === retryConfig.maxRetries || !retryConfig.shouldRetry(error)) {
        throw error;
      }

      const delay = retryConfig.exponential
        ? Math.min(retryConfig.baseDelay * Math.pow(2, attempt), retryConfig.maxDelay)
        : retryConfig.baseDelay;

      console.warn(
        `Operation failed (attempt ${attempt + 1}/${retryConfig.maxRetries + 1}). ` +
        `Retrying in ${delay}ms...`,
        error
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export async function withFallback<T>(
  operation: () => Promise<T>,
  fallbackConfig: FallbackConfig<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error('Operation failed, attempting fallback:', error);
    
    if (fallbackConfig.onFallback) {
      fallbackConfig.onFallback(error);
    }

    if (fallbackConfig.fallbackFn) {
      return await fallbackConfig.fallbackFn();
    }

    if ('defaultValue' in fallbackConfig) {
      return fallbackConfig.defaultValue!;
    }

    throw error;
  }
}

export async function withCircuitBreaker<T>(
  operation: () => Promise<T>,
  threshold: number = 5,
  resetTimeout: number = 60000
): Promise<T> {
  const circuitKey = operation.toString();
  const state = CircuitBreakerState.getInstance();

  if (state.isOpen(circuitKey)) {
    if (Date.now() - state.getLastFailure(circuitKey)! >= resetTimeout) {
      state.halfOpen(circuitKey);
    } else {
      throw new Error('Circuit breaker is open');
    }
  }

  try {
    const result = await operation();
    state.onSuccess(circuitKey);
    return result;
  } catch (error) {
    state.onFailure(circuitKey);
    if (state.getFailureCount(circuitKey) >= threshold) {
      state.open(circuitKey);
    }
    throw error;
  }
}

class CircuitBreakerState {
  private static instance: CircuitBreakerState;
  private states: Map<string, 'CLOSED' | 'OPEN' | 'HALF-OPEN'>;
  private failureCounts: Map<string, number>;
  private lastFailures: Map<string, number>;

  private constructor() {
    this.states = new Map();
    this.failureCounts = new Map();
    this.lastFailures = new Map();
  }

  static getInstance(): CircuitBreakerState {
    if (!CircuitBreakerState.instance) {
      CircuitBreakerState.instance = new CircuitBreakerState();
    }
    return CircuitBreakerState.instance;
  }

  isOpen(key: string): boolean {
    return this.states.get(key) === 'OPEN';
  }

  open(key: string): void {
    this.states.set(key, 'OPEN');
    this.lastFailures.set(key, Date.now());
  }

  halfOpen(key: string): void {
    this.states.set(key, 'HALF-OPEN');
  }

  getFailureCount(key: string): number {
    return this.failureCounts.get(key) || 0;
  }

  getLastFailure(key: string): number | undefined {
    return this.lastFailures.get(key);
  }

  onSuccess(key: string): void {
    this.states.set(key, 'CLOSED');
    this.failureCounts.set(key, 0);
    this.lastFailures.delete(key);
  }

  onFailure(key: string): void {
    const count = (this.failureCounts.get(key) || 0) + 1;
    this.failureCounts.set(key, count);
    this.lastFailures.set(key, Date.now());
  }
}

export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 5000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
  });

  return Promise.race([operation(), timeoutPromise]);
}

export class ErrorBoundary {
  private static errorCounts: Map<string, number> = new Map();
  private static readonly ERROR_THRESHOLD = 3;
  private static readonly RESET_INTERVAL = 60000; // 1 minute

  static async wrap<T>(
    operation: () => Promise<T>,
    errorKey: string,
    fallback?: () => Promise<T>
  ): Promise<T> {
    try {
      const result = await operation();
      this.resetErrorCount(errorKey);
      return result;
    } catch (error) {
      this.incrementErrorCount(errorKey);
      
      if (this.shouldTriggerFallback(errorKey)) {
        console.error(`Error threshold reached for ${errorKey}, triggering fallback`);
        if (fallback) {
          return await fallback();
        }
      }
      
      throw error;
    }
  }

  private static incrementErrorCount(key: string): void {
    const count = (this.errorCounts.get(key) || 0) + 1;
    this.errorCounts.set(key, count);
    
    // Schedule reset
    setTimeout(() => this.resetErrorCount(key), this.RESET_INTERVAL);
  }

  private static resetErrorCount(key: string): void {
    this.errorCounts.delete(key);
  }

  private static shouldTriggerFallback(key: string): boolean {
    return (this.errorCounts.get(key) || 0) >= this.ERROR_THRESHOLD;
  }
}
