import type { HttpClient } from '../http.js';

/**
 * Base class for resources. Holds the default companyId so individual
 * resource methods can fall back when the caller does not pass one.
 */
export abstract class CompanyScopedResource {
  constructor(
    protected readonly http: HttpClient,
    protected readonly defaultCompanyId?: string
  ) {}

  protected resolveCompany(companyId?: string): string {
    const id = companyId ?? this.defaultCompanyId;
    if (!id) {
      throw new Error(
        'Paylocity API requires a companyId. Pass companyId explicitly or set ' +
          'defaultCompanyId on the PaylocityClient.'
      );
    }
    return encodeURIComponent(id);
  }
}
