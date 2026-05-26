/**
 * Paylocity error hierarchy.
 *
 * Paylocity returns two error envelope shapes:
 *   Modern (CoreHR / API Hub) — RFC 7807-ish:
 *     { type?, title?, status?, detail?, instance?, traceId? }
 *   Legacy (/api/v1, /api/v2):
 *     { errors: [{ field?, input?, message, statusCode? }] }
 *
 * The HTTP layer threads the raw body into `response` so callers can inspect
 * either shape, and surfaces `traceId` separately when present.
 */
export class PaylocityError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response: unknown,
    public traceId?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Backwards-friendly alias.
export const ServiceError = PaylocityError;

export class AuthenticationError extends PaylocityError {
  constructor(message: string, response: unknown, traceId?: string) {
    super(message, 401, response, traceId);
  }
}

export class ForbiddenError extends PaylocityError {
  constructor(message: string, response: unknown, traceId?: string) {
    super(message, 403, response, traceId);
  }
}

export class NotFoundError extends PaylocityError {
  constructor(message: string, response: unknown, traceId?: string) {
    super(message, 404, response, traceId);
  }
}

export class ValidationError extends PaylocityError {
  constructor(
    message: string,
    public errors: Array<{ field?: string; message: string }>,
    response: unknown,
    traceId?: string
  ) {
    super(message, 400, response, traceId);
  }
}

export class RateLimitError extends PaylocityError {
  constructor(
    message: string,
    public retryAfter: number,
    response: unknown,
    traceId?: string
  ) {
    super(message, 429, response, traceId);
  }
}

export class ServerError extends PaylocityError {
  constructor(message: string, response: unknown, traceId?: string) {
    super(message, 500, response, traceId);
  }
}

/**
 * Extract a usable error message + traceId from either error envelope.
 */
export function extractErrorDetails(
  response: unknown,
  fallback: string
): { message: string; traceId?: string; validationErrors?: Array<{ field?: string; message: string }> } {
  if (!response || typeof response !== 'object') return { message: fallback };
  const obj = response as Record<string, unknown>;

  // Modern RFC 7807-ish
  if (typeof obj.title === 'string' || typeof obj.detail === 'string') {
    const parts: string[] = [];
    if (typeof obj.title === 'string') parts.push(obj.title);
    if (typeof obj.detail === 'string') parts.push(obj.detail);
    return {
      message: parts.join(': ') || fallback,
      traceId: typeof obj.traceId === 'string' ? obj.traceId : undefined,
    };
  }

  // Legacy array
  if (Array.isArray(obj.errors)) {
    const errs = obj.errors as Array<{ field?: string; message?: string }>;
    const messages = errs
      .map(e => (e.field ? `${e.field}: ${e.message}` : e.message))
      .filter(Boolean) as string[];
    return {
      message: messages.join('; ') || fallback,
      validationErrors: errs.map(e => ({
        field: e.field,
        message: e.message ?? '(unspecified)',
      })),
    };
  }

  return { message: fallback };
}
