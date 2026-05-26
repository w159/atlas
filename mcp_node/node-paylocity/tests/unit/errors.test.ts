import { describe, it, expect } from 'vitest';
import {
  PaylocityError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ValidationError,
  extractErrorDetails,
} from '../../src/index.js';

describe('Error types', () => {
  it('all error types extend PaylocityError and preserve statusCode', () => {
    expect(new AuthenticationError('m', null).statusCode).toBe(401);
    expect(new ForbiddenError('m', null).statusCode).toBe(403);
    expect(new NotFoundError('m', null).statusCode).toBe(404);
    expect(new ValidationError('m', [], null).statusCode).toBe(400);
    expect(new RateLimitError('m', 5, null).statusCode).toBe(429);
    expect(new ServerError('m', null).statusCode).toBe(500);

    expect(new AuthenticationError('m', null)).toBeInstanceOf(PaylocityError);
    expect(new ForbiddenError('m', null)).toBeInstanceOf(PaylocityError);
  });

  it('extractErrorDetails handles modern RFC 7807 shape', () => {
    const r = extractErrorDetails(
      { title: 'Bad', detail: 'something broke', traceId: 'abc' },
      'fallback'
    );
    expect(r.message).toBe('Bad: something broke');
    expect(r.traceId).toBe('abc');
  });

  it('extractErrorDetails handles legacy array shape', () => {
    const r = extractErrorDetails(
      { errors: [{ field: 'firstName', message: 'Required' }] },
      'fallback'
    );
    expect(r.message).toBe('firstName: Required');
    expect(r.validationErrors?.length).toBe(1);
  });

  it('extractErrorDetails falls back when shape unknown', () => {
    expect(extractErrorDetails('weird', 'fallback').message).toBe('fallback');
  });
});
