import type { HttpClient } from '../http.js';
import type { Person, PersonListParams, NormalizedList } from '../types/index.js';
import { unwrapPaginatedResponse } from '../pagination.js';

export class PeopleResource {
  constructor(private readonly http: HttpClient) {}

  async list(params: PersonListParams = {}): Promise<NormalizedList<Person>> {
    const response = await this.http.request<unknown>('/people', { params });
    return unwrapPaginatedResponse<Person>(response);
  }

  async get(id: string): Promise<Person> {
    return this.http.request<Person>(`/people/${encodeURIComponent(id)}`);
  }
}
