import type { HttpClient } from '../http.js';

export class CredentialsResource {
  constructor(private getClient: () => Promise<HttpClient>) {}

  async verify(): Promise<{ valid: boolean }> {
    const client = await this.getClient();
    const response = await client.request<{ success?: boolean }>('/authentication/verify');
    return { valid: response.success !== false };
  }
}