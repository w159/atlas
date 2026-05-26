export interface ThreatLockerClientConfig {
  apiKey: string;
  organizationId?: string;
  baseUrl?: string;
  maxRetries?: number;
  rateLimitPerSecond?: number;
}

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  isAscending?: boolean;
  orderBy?: string;
  searchText?: string;
  childOrganizations?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface SearchBody extends PaginationParams {
  pageNumber: number;
  pageSize: number;
  isAscending: boolean;
  orderBy: string;
  searchText: string;
  childOrganizations: boolean;
}

export function buildSearchBody(params: Partial<PaginationParams> = {}): SearchBody {
  return {
    pageNumber: params.pageNumber ?? 1,
    pageSize: params.pageSize ?? 25,
    isAscending: params.isAscending ?? true,
    orderBy: params.orderBy ?? '',
    searchText: params.searchText ?? '',
    childOrganizations: params.childOrganizations ?? false,
  };
}