import { describe, it, expect } from 'vitest';
import {
  ServiceError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ValidationError,
} from '../../src/index.js';

describe('Error types', () => {
  it('all error types extend ServiceError and preserve statusCode', () => {
    expect(new AuthenticationError('m', null).statusCode).toBe(401);
    expect(new ForbiddenError('m', null).statusCode).toBe(403);
    expect(new NotFoundError('m', null).statusCode).toBe(404);
    expect(new ValidationError('m', [], null).statusCode).toBe(400);
    expect(new RateLimitError('m', 5, null).statusCode).toBe(429);
    expect(new ServerError('m', null).statusCode).toBe(500);

    expect(new AuthenticationError('m', null)).toBeInstanceOf(ServiceError);
    expect(new ForbiddenError('m', null)).toBeInstanceOf(ServiceError);
  });
});
