export interface JsonApiResource<T = unknown> {
  id: string;
  type: string;
  attributes?: T;
  relationships?: Record<string, {
    data?: JsonApiResourceIdentifier | JsonApiResourceIdentifier[];
    links?: JsonApiLinks;
  }>;
  links?: JsonApiLinks;
}

export interface JsonApiResourceIdentifier {
  id: string;
  type: string;
}

export interface JsonApiResponse<T = unknown> {
  data: JsonApiResource<T> | JsonApiResource<T>[];
  included?: JsonApiResource[];
  links?: JsonApiLinks;
  meta?: JsonApiMeta;
}

export interface JsonApiLinks {
  self?: string;
  first?: string;
  prev?: string;
  next?: string;
  last?: string;
}

export interface JsonApiMeta {
  totalRecords?: number;
  pageFirst?: number;
  pageSize?: number;
  [key: string]: unknown;
}

export interface Page<T> {
  data: T[];
  links: JsonApiLinks;
  meta: JsonApiMeta;
}

export interface PaginationOptions {
  pageSize?: number;
  pageAfter?: string;
  filters?: Record<string, string>;
}