/**
 * Custom error classes for the Spanning client.
 */

/**
 * Base error class for all Spanning errors.
 */
export class SpanningError extends Error {
  /** HTTP status code (0 for non-HTTP failures). */
  readonly statusCode: number;
  /** Raw response body, if available. */
  readonly response: unknown;

  constructor(message: string, statusCode: number = 0, response?: unknown) {
    super(message);
    this.name = 'SpanningError';
    this.statusCode = statusCode;
    this.response = response;
    Object.setPrototypeOf(this, SpanningError.prototype);
  }
}

/**
 * Authentication error (401 unauthorized).
 *
 * Spanning tokens are bound to the admin email they were issued for. If
 * either the admin email OR the token is wrong (or they don't match the
 * pair Spanning has on file), the upstream API returns a generic 401. The
 * error message hints to verify BOTH fields together.
 *
 * Also note: a token issued for one platform (e.g. m365) cannot be used
 * against another platform (e.g. gws / salesforce) — same generic 401.
 */
export class SpanningAuthenticationError extends SpanningError {
  constructor(message: string, statusCode: number = 401, response?: unknown) {
    super(message, statusCode, response);
    this.name = 'SpanningAuthenticationError';
    Object.setPrototypeOf(this, SpanningAuthenticationError.prototype);
  }
}

/**
 * Forbidden (403) — token is valid but out of scope for the requested resource.
 */
export class SpanningForbiddenError extends SpanningError {
  constructor(message: string, response?: unknown) {
    super(message, 403, response);
    this.name = 'SpanningForbiddenError';
    Object.setPrototypeOf(this, SpanningForbiddenError.prototype);
  }
}

/**
 * Resource not found (404).
 */
export class SpanningNotFoundError extends SpanningError {
  constructor(message: string, response?: unknown) {
    super(message, 404, response);
    this.name = 'SpanningNotFoundError';
    Object.setPrototypeOf(this, SpanningNotFoundError.prototype);
  }
}

/**
 * Conflict (409) — typically returned when a restore is already queued for the
 * same items.
 */
export class SpanningConflictError extends SpanningError {
  constructor(message: string, response?: unknown) {
    super(message, 409, response);
    this.name = 'SpanningConflictError';
    Object.setPrototypeOf(this, SpanningConflictError.prototype);
  }
}

/**
 * Rate limit exceeded (429).
 */
export class SpanningRateLimitError extends SpanningError {
  /** Suggested retry delay in milliseconds (parsed from Retry-After). */
  readonly retryAfter: number;

  constructor(message: string, retryAfter: number = 5000, response?: unknown) {
    super(message, 429, response);
    this.name = 'SpanningRateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, SpanningRateLimitError.prototype);
  }
}

/**
 * Server error (500-503).
 */
export class SpanningServerError extends SpanningError {
  constructor(message: string, statusCode: number = 500, response?: unknown) {
    super(message, statusCode, response);
    this.name = 'SpanningServerError';
    Object.setPrototypeOf(this, SpanningServerError.prototype);
  }
}

/**
 * Thrown by placeholder resources (gws, salesforce) until they are implemented.
 */
export class NotImplementedError extends SpanningError {
  constructor(message: string) {
    super(message, 0);
    this.name = 'NotImplementedError';
    Object.setPrototypeOf(this, NotImplementedError.prototype);
  }
}
