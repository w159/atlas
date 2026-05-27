import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

interface MaybeAuvikError {
  status?: number;
  message?: string;
  retryAfter?: number;
}

export function toMcpError(error: unknown): McpError {
  if (error instanceof McpError) return error;

  const e = error as MaybeAuvikError;
  const status = typeof e?.status === 'number' ? e.status : 0;
  const msg = e?.message || (typeof error === 'string' ? error : 'Unknown error');

  switch (status) {
    case 400:
      return new McpError(ErrorCode.InvalidParams, `Auvik 400 bad request: ${msg}`);
    case 401:
      return new McpError(ErrorCode.InvalidRequest, 'Auvik 401 — invalid credentials (check AUVIK_USERNAME / AUVIK_API_KEY)');
    case 403:
      return new McpError(ErrorCode.InvalidRequest, 'Auvik 403 — credentials valid but role lacks API access');
    case 404:
      return new McpError(ErrorCode.InvalidRequest, `Auvik 404 — resource or endpoint not found: ${msg}`);
    case 429: {
      const retry = e?.retryAfter ? ` (retry after ${e.retryAfter}s)` : '';
      return new McpError(ErrorCode.InternalError, `Auvik 429 — rate limit (2500 req / 5min) exceeded${retry}`);
    }
    case 500:
    case 502:
    case 503:
    case 504:
      return new McpError(ErrorCode.InternalError, `Auvik ${status} — upstream service error: ${msg}`);
    default:
      return new McpError(ErrorCode.InternalError, msg);
  }
}
