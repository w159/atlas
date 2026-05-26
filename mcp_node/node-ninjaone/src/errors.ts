/**
 * Custom error classes for the NinjaOne client
 */

/**
 * Base error class for all NinjaOne errors
 */
export class NinjaOneError extends Error {
  /** HTTP status code if applicable */
  readonly statusCode: number;
  /** Raw response data if available */
  readonly response: unknown;

  constructor(message: string, statusCode: number = 0, response?: unknown) {
    super(message);
    this.name = 'NinjaOneError';
    this.statusCode = statusCode;
    this.response = response;
    Object.setPrototypeOf(this, NinjaOneError.prototype);
  }
}

/**
 * Authentication error (400 bad credentials, 401 unauthorized)
 */
export class NinjaOneAuthenticationError extends NinjaOneError {
  constructor(message: string, statusCode: number = 401, response?: unknown) {
    super(message, statusCode, response);
    this.name = 'NinjaOneAuthenticationError';
    Object.setPrototypeOf(this, NinjaOneAuthenticationError.prototype);
  }
}

/**
 * Forbidden error (403 permission denied)
 */
export class NinjaOneForbiddenError extends NinjaOneError {
  constructor(message: string, response?: unknown) {
    super(message, 403, response);
    this.name = 'NinjaOneForbiddenError';
    Object.setPrototypeOf(this, NinjaOneForbiddenError.prototype);
  }
}

/**
 * Resource not found error (404)
 */
export class NinjaOneNotFoundError extends NinjaOneError {
  constructor(message: string, response?: unknown) {
    super(message, 404, response);
    this.name = 'NinjaOneNotFoundError';
    Object.setPrototypeOf(this, NinjaOneNotFoundError.prototype);
  }
}

/**
 * Validation error (400 with field-level errors)
 */
export class NinjaOneValidationError extends NinjaOneError {
  /** Field-level validation errors */
  readonly errors: Array<{ field: string; message: string }>;

  constructor(message: string, errors: Array<{ field: string; message: string }> = [], response?: unknown) {
    super(message, 400, response);
    this.name = 'NinjaOneValidationError';
    this.errors = errors;
    Object.setPrototypeOf(this, NinjaOneValidationError.prototype);
  }
}

/**
 * Rate limit exceeded error (429)
 */
export class NinjaOneRateLimitError extends NinjaOneError {
  /** Suggested retry delay in milliseconds */
  readonly retryAfter: number;

  constructor(message: string, retryAfter: number = 5000, response?: unknown) {
    super(message, 429, response);
    this.name = 'NinjaOneRateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, NinjaOneRateLimitError.prototype);
  }
}

/**
 * Server error (500+)
 */
export class NinjaOneServerError extends NinjaOneError {
  constructor(message: string, statusCode: number = 500, response?: unknown) {
    super(message, statusCode, response);
    this.name = 'NinjaOneServerError';
    Object.setPrototypeOf(this, NinjaOneServerError.prototype);
  }
}
