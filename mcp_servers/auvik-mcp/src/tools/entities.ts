import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCredentials } from '../credentials.js';
import { createAuvikClient } from '../client-factory.js';
import { toMcpError } from '../errors.js';

const noCreds = () => ({ content: [{ type: 'text' as const, text: 'No Auvik credentials configured.' }], isError: true });
const ok = (r: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(r, null, 2) }] });
const fail = (e: unknown) => { const m = toMcpError(e); return { content: [{ type: 'text' as const, text: m.message }], isError: true }; };

export const entitiesListNotesTool: Tool = {
  name: 'auvik_entities_list_notes',
  description: 'GET /v1/inventory/entity/note — list notes attached to entities (devices, networks).',
  inputSchema: {
    type: 'object',
    properties: {
      tenants: { type: 'string', description: 'Comma-separated tenant IDs (required).' },
      pageSize: { type: 'number' },
      pageAfter: { type: 'string' },
      filter_entityId: { type: 'string', description: 'filter[entityId].' },
    },
    required: ['tenants'],
    additionalProperties: false,
  },
};

export const entitiesListAuditsTool: Tool = {
  name: 'auvik_entities_list_audits',
  description: 'GET /v1/inventory/entity/audit — list audit log entries (user actions: terminal sessions, config changes, etc.).',
  inputSchema: {
    type: 'object',
    properties: {
      tenants: { type: 'string', description: 'Comma-separated tenant IDs (required).' },
      pageSize: { type: 'number' },
      pageAfter: { type: 'string' },
      filter_entityId: { type: 'string', description: 'filter[entityId].' },
      filter_category: { type: 'string', description: 'filter[category], e.g. "terminal".' },
    },
    required: ['tenants'],
    additionalProperties: false,
  },
};

export async function handleEntitiesListNotes(args: Record<string, unknown>) {
  try { const c = getCredentials(); if (!c) return noCreds(); return ok(await createAuvikClient(c).entities.listNotes(args)); } catch (e) { return fail(e); }
}
export async function handleEntitiesListAudits(args: Record<string, unknown>) {
  try { const c = getCredentials(); if (!c) return noCreds(); return ok(await createAuvikClient(c).entities.listAudits(args)); } catch (e) { return fail(e); }
}
