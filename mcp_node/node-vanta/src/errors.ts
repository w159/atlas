export class ServiceError extends Error {
  constructor(message: string, public statusCode: number, public response: unknown) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthenticationError extends ServiceError {
  constructor(message: string, response: unknown) {
    super(message, 401, response);
  }
}

export class ForbiddenError extends ServiceError {
  constructor(message: string, response: unknown) {
    super(message, 403, response);
  }
}

export class NotFoundError extends ServiceError {
  constructor(message: string, response: unknown) {
    super(message, 404, response);
  }
}

export class ValidationError extends ServiceError {
  constructor(message: string, public errors: Array<{ field: string; message: string }>, response: unknown) {
    super(message, 400, response);
  }
}

export class RateLimitError extends ServiceError {
  constructor(message: string, public retryAfter: number, response: unknown) {
    super(message, 429, response);
  }
}

export class ServerError extends ServiceError {
  constructor(message: string, response: unknown) {
    super(message, 500, response);
  }
}
