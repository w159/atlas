import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'spanning_audit_list',
      description:
        'List audit log entries (admin actions, restore operations) for the connected org. Cursor-paginated; optionally bounded by from/to ISO 8601 dates.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          from: { type: 'string', description: 'ISO 8601 lower bound (inclusive).' },
          to: { type: 'string', description: 'ISO 8601 upper bound (inclusive).' },
          limit: { type: 'number', description: 'Page size (1-500, default 100).' },
          cursor: { type: 'string', description: 'Cursor from previous page.' },
        },
      },
    },
    {
      name: 'spanning_audit_list_all',
      description:
        'Iterate every audit entry across all pages (within optional from/to bounds) and return the full collection. Use sparingly on large windows — Spanning enforces 100 req/min.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          from: { type: 'string', description: 'ISO 8601 lower bound (inclusive).' },
          to: { type: 'string', description: 'ISO 8601 upper bound (inclusive).' },
          limit: { type: 'number', description: 'Page size per fetch (1-500, default 100).' },
          maxItems: { type: 'number', description: 'Optional hard cap on items returned.' },
        },
      },
    },
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = getClient();
  switch (toolName) {
    case 'spanning_audit_list': {
      const params = {
        from: args.from as string | undefined,
        to: args.to as string | undefined,
        limit: args.limit as number | undefined,
        cursor: args.cursor as string | undefined,
      };
      logger.info('API call: audit.list', params);
      const result = await client.audit.list(params);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
    case 'spanning_audit_list_all': {
      const from = args.from as string | undefined;
      const to = args.to as string | undefined;
      const limit = args.limit as number | undefined;
      const maxItems = (args.maxItems as number | undefined) ?? Infinity;
      const items: unknown[] = [];
      logger.info('API call: audit.listAll', { from, to, limit, maxItems });
      const iterParams: Record<string, unknown> = {};
      if (limit) iterParams['limit'] = limit;
      if (from) iterParams['from'] = from;
      if (to) iterParams['to'] = to;
      for await (const item of client.audit.listAll(iterParams as Parameters<typeof client.audit.listAll>[0])) {
        items.push(item);
        if (items.length >= maxItems) break;
      }
      return { content: [{ type: 'text', text: JSON.stringify({ count: items.length, items }, null, 2) }] };
    }
    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${toolName}` }], isError: true };
  }
}

export const auditHandler: DomainHandler = { getTools, handleCall };
