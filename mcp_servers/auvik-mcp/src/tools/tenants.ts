import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCredentials } from '../credentials.js';
import { createAuvikClient } from '../client-factory.js';
import { toMcpError } from '../errors.js';

const noCredsResult = () => ({
  content: [{ type: 'text' as const, text: 'No Auvik credentials configured (AUVIK_USERNAME / AUVIK_API_KEY required).' }],
  isError: true,
});

const ok = (response: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(response, null, 2) }],
});

const fail = (e: unknown) => {
  const m = toMcpError(e);
  return { content: [{ type: 'text' as const, text: m.message }], isError: true };
};

export const tenantsListTool: Tool = {
  name: 'auvik_tenants_list',
  description: 'GET /v1/tenants — list all Auvik tenants (MSP clients + parents) accessible to the current credentials. Returns tenant IDs (numeric string) and domainPrefix used by other endpoints.',
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
};

export const tenantsDetailTool: Tool = {
  name: 'auvik_tenants_detail',
  description: 'GET /v1/tenants/detail?tenantDomainPrefix=<prefix> — extended tenant metadata (displayName, subscription, authorizations). Takes the tenant domain PREFIX (e.g. "thfg"), not the tenant ID.',
  inputSchema: {
    type: 'object',
    properties: {
      tenantDomainPrefix: { type: 'string', description: 'Tenant domain prefix from /tenants attributes.domainPrefix (e.g. "acme").' },
    },
    required: ['tenantDomainPrefix'],
    additionalProperties: false,
  },
};

export async function handleTenantsList() {
  try {
    const c = getCredentials();
    if (!c) return noCredsResult();
    return ok(await createAuvikClient(c).tenants.list());
  } catch (e) {
    return fail(e);
  }
}

export async function handleTenantsDetail(args: { tenantDomainPrefix: string }) {
  try {
    const c = getCredentials();
    if (!c) return noCredsResult();
    return ok(await createAuvikClient(c).tenants.detail(args.tenantDomainPrefix));
  } catch (e) {
    return fail(e);
  }
}
