import type { HttpClient } from '../http.js';
import type { Document, DocumentListParams, NormalizedList } from '../types/index.js';
import { unwrapPaginatedResponse } from '../pagination.js';

export class DocumentsResource {
  constructor(private readonly http: HttpClient) {}

  async list(params: DocumentListParams = {}): Promise<NormalizedList<Document>> {
    const response = await this.http.request<unknown>('/documents', { params });
    return unwrapPaginatedResponse<Document>(response);
  }

  async get(id: string): Promise<Document> {
    return this.http.request<Document>(`/documents/${encodeURIComponent(id)}`);
  }
}
