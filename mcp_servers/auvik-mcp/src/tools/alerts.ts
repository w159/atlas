import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCredentials } from '../credentials.js';
import { createAuvikClient } from '../client-factory.js';
import { toMcpError } from '../errors.js';

const noCreds = () => ({ content: [{ type: 'text' as const, text: 'No Auvik credentials configured.' }], isError: true });
const ok = (r: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(r, null, 2) }] });
const fail = (e: unknown) => { const m = toMcpError(e); return { content: [{ type: 'text' as const, text: m.message }], isError: true }; };

export const alertsListTool: Tool = {
  name: 'auvik_alerts_list',
  description: 'GET /v1/alert/history/info — list alerts. Filterable via filter[status], filter[severity], etc. The single-alert endpoint (auvik_alerts_get) returns the same shape as a list item.',
  inputSchema: {
    type: 'object',
    properties: {
      tenants: { type: 'string', description: 'Comma-separated tenant IDs (required).' },
      pageSize: { type: 'number' },
      pageAfter: { type: 'string' },
      filter_status: { type: 'string', enum: ['created', 'acknowledged', 'resolved', 'cleared'], description: 'filter[status].' },
      filter_severity: { type: 'string', enum: ['unknown', 'emergency', 'critical', 'warning', 'info'], description: 'filter[severity].' },
      filter_detectedTimeAfter: { type: 'string', description: 'filter[detectedTimeAfter] ISO 8601.' },
      filter_detectedTimeBefore: { type: 'string', description: 'filter[detectedTimeBefore] ISO 8601.' },
      filter_dismissed: { type: 'boolean', description: 'filter[dismissed].' },
    },
    required: ['tenants'],
    additionalProperties: false,
  },
};

export const alertsGetTool: Tool = {
  name: 'auvik_alerts_get',
  description: 'GET /v1/alert/history/info/{alertId} — single alert detail.',
  inputSchema: {
    type: 'object',
    properties: { alertId: { type: 'string', description: 'Auvik alert ID.' } },
    required: ['alertId'],
    additionalProperties: false,
  },
};

export async function handleAlertsList(args: Record<string, unknown>) {
  try { const c = getCredentials(); if (!c) return noCreds(); return ok(await createAuvikClient(c).alerts.list(args)); } catch (e) { return fail(e); }
}
export async function handleAlertsGet(args: { alertId: string }) {
  try { const c = getCredentials(); if (!c) return noCreds(); return ok(await createAuvikClient(c).alerts.get(args.alertId)); } catch (e) { return fail(e); }
}
