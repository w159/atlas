import type { NormalizedList, VantaPageEnvelope } from './types/common.js';

/**
 * Vanta returns pages wrapped as `{ results: { data, pageInfo } }`.
 * Normalize that into `{ items, endCursor, hasNextPage }` for the MCP layer.
 */
export function unwrapPaginatedResponse<T>(response: unknown): NormalizedList<T> {
  const env = response as Partial<VantaPageEnvelope<T>> | undefined;
  const results = env?.results;
  const data = (results?.data ?? []) as T[];
  const info = results?.pageInfo;
  return {
    items: data,
    endCursor: info?.endCursor ?? null,
    hasNextPage: Boolean(info?.hasNextPage),
    startCursor: info?.startCursor ?? null,
    hasPreviousPage: Boolean(info?.hasPreviousPage),
  };
}

/**
 * Helper: iterate every page of a list endpoint, accumulating items.
 * Caller passes a function that fetches one page given a cursor.
 */
export async function fetchAllPages<T>(
  fetchPage: (cursor?: string) => Promise<NormalizedList<T>>,
  maxPages = 50
): Promise<T[]> {
  const acc: T[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < maxPages; i++) {
    const page = await fetchPage(cursor);
    acc.push(...page.items);
    if (!page.hasNextPage || !page.endCursor) return acc;
    cursor = page.endCursor;
  }
  return acc;
}
