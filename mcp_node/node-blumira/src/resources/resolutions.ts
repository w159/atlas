import type { HttpClient } from '../http.js';
import type { Resolution } from '../types/index.js';

export class ResolutionsResource {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Resolution[]> {
    return this.http.request<Resolution[]>('/resolutions');
  }
}
