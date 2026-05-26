import type { PaginatedResponse } from './types/index.js';

export interface ThreatLockerResponse {
  totalItems?: number;
  items?: unknown[];
  // ThreatLocker may use different property names
  data?: unknown[];
  results?: unknown[];
}

export function unwrapPaginatedResponse<T>(
  response: ThreatLockerResponse,
  pageNumber: number,
  pageSize: number
): PaginatedResponse<T> {
  // Defensively extract items from various possible property names
  const items = (response.items || response.data || response.results || []) as T[];
  const total = response.totalItems || 0;
  const hasMore = pageNumber * pageSize < total;

  return {
    items,
    page: pageNumber,
    pageSize,
    total,
    hasMore,
  };
}