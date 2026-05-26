export interface VantaClientConfig {
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
  tokenUrl?: string;
  scope?: string;
  maxRetries?: number;
  rateLimitPerSecond?: number;
}

export interface ListParams {
  pageSize?: number;
  pageCursor?: string;
  [key: string]: unknown;
}

export interface NormalizedList<T> {
  items: T[];
  endCursor: string | null;
  hasNextPage: boolean;
  startCursor?: string | null;
  hasPreviousPage?: boolean;
}

/** Vanta's standard envelope: `{ results: { data, pageInfo } }`. */
export interface VantaPageEnvelope<T> {
  results: {
    data: T[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
      startCursor?: string | null;
      hasPreviousPage?: boolean;
    };
  };
}

export interface VantaToken {
  accessToken: string;
  expiresAt: number; // epoch ms
  tokenType: string;
}
