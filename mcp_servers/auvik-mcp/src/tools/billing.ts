import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCredentials } from '../credentials.js';
import { createAuvikClient } from '../client-factory.js';
import { toMcpError } from '../errors.js';

const noCreds = () => ({ content: [{ type: 'text' as const, text: 'No Auvik credentials configured.' }], isError: true });
const ok = (r: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(r, null, 2) }] });
const fail = (e: unknown) => { const m = toMcpError(e); return { content: [{ type: 'text' as const, text: m.message }], isError: true }; };

export const billingClientUsageTool: Tool = {
  name: 'auvik_billing_client_usage',
  description: 'GET /v1/billing/usage/client?filter[fromDate]=YYYY-MM-DD&filter[thruDate]=YYYY-MM-DD — per-client billable device counts for the date range. Dates are calendar dates, not timestamps.',
  inputSchema: {
    type: 'object',
    properties: {
      fromDate: { type: 'string', description: 'Start date YYYY-MM-DD. Sent as filter[fromDate].' },
      thruDate: { type: 'string', description: 'End date YYYY-MM-DD. Sent as filter[thruDate].' },
    },
    required: ['fromDate', 'thruDate'],
    additionalProperties: false,
  },
};

export async function handleBillingClientUsage(args: { fromDate: string; thruDate: string }) {
  try {
    const c = getCredentials();
    if (!c) return noCreds();
    return ok(
      await createAuvikClient(c).billing.clientUsage({
        filter_fromDate: args.fromDate,
        filter_thruDate: args.thruDate,
      })
    );
  } catch (e) {
    return fail(e);
  }
}
