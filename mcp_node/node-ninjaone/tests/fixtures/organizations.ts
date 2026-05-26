/**
 * Organization fixtures
 */

import type { Organization, OrganizationDetailed } from '../../src/types/organizations.js';

export const list: Organization[] = [
  {
    id: 1,
    name: 'Acme Corp',
    description: 'Main organization',
    nodeApprovalMode: 'AUTOMATIC',
    createTime: 1704067200000,
    updateTime: 1704153600000,
  },
  {
    id: 2,
    name: 'Test Company',
    description: 'Test organization',
    nodeApprovalMode: 'MANUAL',
    createTime: 1704067200000,
    updateTime: 1704153600000,
  },
];

export const single: Organization = {
  id: 1,
  name: 'Acme Corp',
  description: 'Main organization',
  nodeApprovalMode: 'AUTOMATIC',
  createTime: 1704067200000,
  updateTime: 1704153600000,
  locations: [
    {
      name: 'Headquarters',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
    },
  ],
};

export const detailed: OrganizationDetailed = {
  ...single,
  deviceCount: 50,
  policyCount: 3,
  backupUsage: 1073741824,
};

export const created: Organization = {
  id: 3,
  name: 'New Organization',
  description: 'Newly created',
  nodeApprovalMode: 'AUTOMATIC',
  createTime: Date.now(),
  updateTime: Date.now(),
};

export const updated: Organization = {
  ...single,
  name: 'Updated Acme Corp',
  updateTime: Date.now(),
};
