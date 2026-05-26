/**
 * License operations — seats used vs. purchased for the connected org.
 */

import type { HttpClient } from '../http.js';
import type { SpanningLicense } from '../types/license.js';

export class LicenseResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /** Get current license / seat usage for the connected org. */
  async get(): Promise<SpanningLicense> {
    return this.httpClient.get<SpanningLicense>('/license');
  }
}
