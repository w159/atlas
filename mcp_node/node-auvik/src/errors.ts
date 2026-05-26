export class AuvikError extends Error {
  constructor(message: string, public statusCode?: number, public response?: unknown, public requestId?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
  }
}

export class AuvikAuthError extends AuvikError {
  constructor(message: string, response?: unknown, requestId?: string) {
    super(message, 401, response, requestId);
  }
}

export class AuvikRateLimitError extends AuvikError {
  constructor(message: string, public retryAfter: number, response?: unknown, requestId?: string) {
    super(message, 403, response, requestId);
  }
}

export class AuvikNotFoundError extends AuvikError {
  constructor(message: string, response?: unknown, requestId?: string) {
    super(message, 404, response, requestId);
  }
}

export class AuvikServerError extends AuvikError {
  constructor(message: string, statusCode: number, response?: unknown, requestId?: string) {
    super(message, statusCode, response, requestId);
  }
}