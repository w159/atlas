import type { HttpClient } from './http.js';
import type { JsonApiResponse, JsonApiResource, Page } from './types/json-api.js';
import { mapJsonApiResourceArray } from './json-api-mapper.js';

export async function* paginate<T>(
  client: HttpClient,
  initialUrl: string,
  params: Record<string, unknown> = {}
): AsyncIterable<Page<T>> {
  let url: string | null = initialUrl;

  while (url) {
    const response: JsonApiResponse<T> = await client.request<JsonApiResponse<T>>(url, { params });

    const page: Page<T> = {
      data: mapJsonApiResourceArray(response.data) as T[],
      links: response.links || {},
      meta: response.meta || {},
    };

    yield page;

    // Get next page URL from links
    url = response.links?.next || null;
    // Clear params for subsequent requests as they're encoded in the next URL
    params = {};
  }
}