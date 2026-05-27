import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCredentials } from '../credentials.js';
import { createAuvikClient } from '../client-factory.js';
import { toMcpError } from '../errors.js';

const noCreds = () => ({ content: [{ type: 'text' as const, text: 'No Auvik credentials configured.' }], isError: true });
const ok = (r: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(r, null, 2) }] });
const fail = (e: unknown) => { const m = toMcpError(e); return { content: [{ type: 'text' as const, text: m.message }], isError: true }; };

export const interfacesListTool: Tool = {
  name: 'auvik_interfaces_list',
  description: 'GET /v1/inventory/interface/info — list network interfaces. Required before fetching interface statistics.',
  inputSchema: {
    type: 'object',
    properties: {
      tenants: { type: 'string', description: 'Comma-separated tenant IDs (required).' },
      pageSize: { type: 'number' },
      pageAfter: { type: 'string' },
      filter_interfaceType: { type: 'string', description: 'filter[interfaceType].' },
      filter_parentDevice: { type: 'string', description: 'filter[parentDevice] — parent device ID.' },
      filter_operationalStatus: { type: 'string', description: 'filter[operationalStatus] (e.g. online/offline).' },
      filter_adminStatus: { type: 'boolean', description: 'filter[adminStatus].' },
    },
    required: ['tenants'],
    additionalProperties: false,
  },
};

export const interfacesGetTool: Tool = {
  name: 'auvik_interfaces_get',
  description: 'GET /v1/inventory/interface/info/{interfaceId} — single interface.',
  inputSchema: {
    type: 'object',
    properties: { interfaceId: { type: 'string', description: 'Auvik interface ID.' } },
    required: ['interfaceId'],
    additionalProperties: false,
  },
};

export async function handleInterfacesList(args: Record<string, unknown>) {
  try { const c = getCredentials(); if (!c) return noCreds(); return ok(await createAuvikClient(c).interfaces.list(args)); } catch (e) { return fail(e); }
}
export async function handleInterfacesGet(args: { interfaceId: string }) {
  try { const c = getCredentials(); if (!c) return noCreds(); return ok(await createAuvikClient(c).interfaces.get(args.interfaceId)); } catch (e) { return fail(e); }
}
