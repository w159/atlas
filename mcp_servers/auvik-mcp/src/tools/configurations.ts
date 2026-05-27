import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCredentials } from '../credentials.js';
import { createAuvikClient } from '../client-factory.js';
import { toMcpError } from '../errors.js';

const noCreds = () => ({ content: [{ type: 'text' as const, text: 'No Auvik credentials configured.' }], isError: true });
const ok = (r: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(r, null, 2) }] });
const fail = (e: unknown) => { const m = toMcpError(e); return { content: [{ type: 'text' as const, text: m.message }], isError: true }; };

export const configurationsListTool: Tool = {
  name: 'auvik_configurations_list',
  description: 'GET /v1/inventory/configuration — list device configuration backup records (backupTime, isRunning, device relationship).',
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

export const configurationsGetTool: Tool = {
  name: 'auvik_configurations_get',
  description: 'GET /v1/inventory/configuration/{configurationId} — single configuration record.',
  inputSchema: {
    type: 'object',
    properties: { configurationId: { type: 'string', description: 'Auvik configuration ID.' } },
    required: ['configurationId'],
    additionalProperties: false,
  },
};

export async function handleConfigurationsList(args: Record<string, unknown>) {
  try { const c = getCredentials(); if (!c) return noCreds(); return ok(await createAuvikClient(c).configurations.list(args)); } catch (e) { return fail(e); }
}
export async function handleConfigurationsGet(args: { configurationId: string }) {
  try { const c = getCredentials(); if (!c) return noCreds(); return ok(await createAuvikClient(c).configurations.get(args.configurationId)); } catch (e) { return fail(e); }
}
