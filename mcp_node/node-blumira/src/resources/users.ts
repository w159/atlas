import type { HttpClient } from '../http.js';
import type { User, PaginatedResponse, PaginationParams } from '../types/index.js';

export class UsersResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    return this.http.request<PaginatedResponse<User>>('/org/users', {
      params: params as Record<string, unknown>,
    });
  }
}
