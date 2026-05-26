/**
 * Common types shared across resources
 */

/**
 * Base list parameters for paginated endpoints
 */
export interface BaseListParams {
  /** Number of records per page (default: 50) */
  pageSize?: number;
  /** Cursor for pagination */
  cursor?: string;
  /** Sort field */
  sortBy?: string;
  /** Sort descending */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Base entity with common fields
 */
export interface BaseEntity {
  id: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  /** Array of results */
  results?: T[];
  /** Cursor for next page */
  cursor?: string;
  /** Total count (if available) */
  totalCount?: number;
}

/**
 * Custom field definition
 */
export interface CustomField {
  /** Field name */
  name: string;
  /** Field value */
  value: string | number | boolean | null;
}

/**
 * Location information
 */
export interface Location {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

/**
 * Timestamp fields common to many entities
 */
export interface TimestampFields {
  /** Creation timestamp */
  createTime?: number;
  /** Last update timestamp */
  updateTime?: number;
}
