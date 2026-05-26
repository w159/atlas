import { describe, it, expect } from 'vitest';
import {
  SpanningError,
  SpanningAuthenticationError,
  SpanningForbiddenError,
  SpanningNotFoundError,
  SpanningConflictError,
  SpanningRateLimitError,
  SpanningServerError,
  NotImplementedError,
} from '../../src/errors.js';

describe('error hierarchy', () => {
  it('all errors inherit from SpanningError', () => {
    expect(new SpanningAuthenticationError('x')).toBeInstanceOf(SpanningError);
    expect(new SpanningForbiddenError('x')).toBeInstanceOf(SpanningError);
    expect(new SpanningNotFoundError('x')).toBeInstanceOf(SpanningError);
    expect(new SpanningConflictError('x')).toBeInstanceOf(SpanningError);
    expect(new SpanningRateLimitError('x')).toBeInstanceOf(SpanningError);
    expect(new SpanningServerError('x')).toBeInstanceOf(SpanningError);
    expect(new NotImplementedError('x')).toBeInstanceOf(SpanningError);
  });

  it('captures statusCode and response body', () => {
    const err = new SpanningNotFoundError('missing', { hint: 'check id' });
    expect(err.statusCode).toBe(404);
    expect(err.response).toEqual({ hint: 'check id' });
  });

  it('rate limit error exposes retryAfter ms', () => {
    const err = new SpanningRateLimitError('slow down', 7500);
    expect(err.retryAfter).toBe(7500);
    expect(err.statusCode).toBe(429);
  });

  it('conflict error defaults to 409', () => {
    const err = new SpanningConflictError('dup');
    expect(err.statusCode).toBe(409);
  });
});
