import type { NormalizedList, PaylocityPageEnvelope } from './types/common.js';

/**
 * Normalize a modern Paylocity page (CoreHR / API Hub) shaped as
 * `{ data: T[], pagination?: { nextToken? } }` into `{ items, nextToken }`.
 */
export function unwrapModernPage<T>(response: unknown): NormalizedList<T> {
  const env = response as Partial<PaylocityPageEnvelope<T>> | undefined;
  const items = (env?.data ?? []) as T[];
  const next = env?.pagination?.nextToken ?? null;
  return { items, nextToken: next || null };
}

/**
 * Normalize a legacy Paylocity response (raw array OR `{ result: [...] }`)
 * into the same `{ items, nextToken }` shape. Legacy endpoints never
 * paginate, so nextToken is always null.
 */
export function unwrapLegacyArray<T>(response: unknown): NormalizedList<T> {
  if (Array.isArray(response)) {
    return { items: response as T[], nextToken: null };
  }
  if (response && typeof response === 'object') {
    const obj = response as Record<string, unknown>;
    // Some legacy endpoints occasionally wrap in `{ result: [...] }`.
    if (Array.isArray(obj.result)) return { items: obj.result as T[], nextToken: null };
    if (Array.isArray(obj.data)) return { items: obj.data as T[], nextToken: null };
  }
  return { items: [], nextToken: null };
}

/**
 * Iterate every page of a modern list endpoint, accumulating items.
 * Caller passes a function that fetches one page given an optional nextToken.
 */
export async function fetchAllPages<T>(
  fetchPage: (nextToken?: string) => Promise<NormalizedList<T>>,
  maxPages = 100
): Promise<T[]> {
  const acc: T[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < maxPages; i++) {
    const page = await fetchPage(cursor);
    acc.push(...page.items);
    if (!page.nextToken) return acc;
    cursor = page.nextToken;
  }
  return acc;
}

/** Async iterator variant — yields each page in order. */
export async function* iteratePages<T>(
  fetchPage: (nextToken?: string) => Promise<NormalizedList<T>>,
  maxPages = 100
): AsyncGenerator<NormalizedList<T>, void, unknown> {
  let cursor: string | undefined;
  for (let i = 0; i < maxPages; i++) {
    const page = await fetchPage(cursor);
    yield page;
    if (!page.nextToken) return;
    cursor = page.nextToken;
  }
}
