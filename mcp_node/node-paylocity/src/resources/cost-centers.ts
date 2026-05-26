import type { CostCenter, ModernListParams, NormalizedList } from '../types/index.js';
import { unwrapModernPage } from '../pagination.js';
import { CompanyScopedResource } from './_base.js';

/**
 * GET /apihub_time/v1/companies/{companyId}/costcenters
 */
export class CostCentersResource extends CompanyScopedResource {
  async list(
    params: ModernListParams & { companyId?: string } = {}
  ): Promise<NormalizedList<CostCenter>> {
    const { companyId, ...rest } = params;
    const cid = this.resolveCompany(companyId);
    const response = await this.http.request<unknown>(
      `/apihub_time/v1/companies/${cid}/costcenters`,
      { params: rest }
    );
    return unwrapModernPage<CostCenter>(response);
  }
}
