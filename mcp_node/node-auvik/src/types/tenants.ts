export interface Tenant {
  id: string;
  domainPrefix?: string;
  tenantName?: string;
  tenantId?: string;
  domainPrefixEnabled?: boolean;
}

export interface TenantDetail extends Tenant {
  parentTenantId?: string;
  tenantType?: 'root' | 'child' | 'client';
  tenantDisplayName?: string;
  timezone?: string;
  currencyCode?: string;
  billingType?: string;
  billingAddress?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}