import type { JobCode, ModernListParams, NormalizedList } from '../types/index.js';
import { unwrapModernPage } from '../pagination.js';
import { CompanyScopedResource } from './_base.js';

/**
 * GET /apihub-positionmanagement/v1/companies/{companyId}/jobcodes
 */
export class JobCodesResource extends CompanyScopedResource {
  async list(
    params: ModernListParams & { companyId?: string } = {}
  ): Promise<NormalizedList<JobCode>> {
    const { companyId, ...rest } = params;
    const cid = this.resolveCompany(companyId);
    const response = await this.http.request<unknown>(
      `/apihub-positionmanagement/v1/companies/${cid}/jobcodes`,
      { params: rest }
    );
    return unwrapModernPage<JobCode>(response);
  }
}
