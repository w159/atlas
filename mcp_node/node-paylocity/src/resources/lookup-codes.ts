import type { LookupCode, LegacyListParams, NormalizedList } from '../types/index.js';
import { unwrapLegacyArray } from '../pagination.js';
import { CompanyScopedResource } from './_base.js';

/**
 * Legacy: GET /api/v2/companies/{companyId}/codes/{codeResource}
 * Examples of codeResource: "paygroup", "EEO", "positions", "departments".
 */
export class LookupCodesResource extends CompanyScopedResource {
  async list(
    codeResource: string,
    params: LegacyListParams & { companyId?: string } = {}
  ): Promise<NormalizedList<LookupCode>> {
    const { companyId, ...rest } = params;
    const cid = this.resolveCompany(companyId);
    const response = await this.http.request<unknown>(
      `/api/v2/companies/${cid}/codes/${encodeURIComponent(codeResource)}`,
      { params: rest }
    );
    return unwrapLegacyArray<LookupCode>(response);
  }
}
