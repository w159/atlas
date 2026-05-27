import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCredentials } from '../credentials.js';
import { createAuvikClient } from '../client-factory.js';
import { toMcpError } from '../errors.js';

const noCreds = () => ({ content: [{ type: 'text' as const, text: 'No Auvik credentials configured.' }], isError: true });
const ok = (r: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(r, null, 2) }] });
const fail = (e: unknown) => { const m = toMcpError(e); return { content: [{ type: 'text' as const, text: m.message }], isError: true }; };

export const networksListTool: Tool = {
  name: 'auvik_networks_list',
  description: 'GET /v1/inventory/network/info — list networks (VLANs/subnets) per tenant.',
  inputSchema: {
    type: 'object',
    properties: {
      tenants: { type: 'string', description: 'Comma-separated tenant IDs (required).' },
      pageSize: { type: 'number', description: 'page[first].' },
      pageAfter: { type: 'string', description: 'page[after] cursor.' },
      filter_networkType: { type: 'string', description: 'filter[networkType], e.g. "vlan".' },
      filter_modifiedAfter: { type: 'string', description: 'filter[modifiedAfter] ISO 8601.' },
      filter_scanStatus: { type: 'string', description: 'filter[scanStatus].' },
    },
    required: ['tenants'],
    additionalProperties: false,
  },
};

export const networksGetTool: Tool = {
  name: 'auvik_networks_get',
  description: 'GET /v1/inventory/network/info/{networkId} — single network basic info.',
  inputSchema: {
    type: 'object',
    properties: { networkId: { type: 'string', description: 'Auvik network ID.' } },
    required: ['networkId'],
    additionalProperties: false,
  },
};

export const networksListDetailTool: Tool = {
  name: 'auvik_networks_list_detail',
  description: 'GET /v1/inventory/network/detail — list network detail records (scope, collectors).',
  inputSchema: {
    type: 'object',
    properties: {
      tenants: { type: 'string', description: 'Comma-separated tenant IDs (required).' },
      pageSize: { type: 'number' },
      pageAfter: { type: 'string' },
    },
    required: ['tenants'],
    additionalProperties: false,
  },
};

export async function handleNetworksList(args: Record<string, unknown>) {
  try { const c = getCredentials(); if (!c) return noCreds(); return ok(await createAuvikClient(c).networks.list(args)); } catch (e) { return fail(e); }
}
export async function handleNetworksGet(args: { networkId: string }) {
  try { const c = getCredentials(); if (!c) return noCreds(); return ok(await createAuvikClient(c).networks.get(args.networkId)); } catch (e) { return fail(e); }
}
export async function handleNetworksListDetail(args: Record<string, unknown>) {
  try { const c = getCredentials(); if (!c) return noCreds(); return ok(await createAuvikClient(c).networks.listDetail(args)); } catch (e) { return fail(e); }
}
