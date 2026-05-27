import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'spanning_backups_list',
      description:
        'List backup runs for a user/service (one record per day per service). Cursor-paginated.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          userId: { type: 'string', description: 'Spanning user ID.' },
          service: {
            type: 'string',
            description: 'Service name returned by spanning_services_list (e.g. mail, drive, calendar, contacts).',
          },
          limit: { type: 'number', description: 'Page size (1-500, default 100).' },
          cursor: { type: 'string', description: 'Cursor from previous page.' },
        },
        required: ['userId', 'service'],
      },
    },
    {
      name: 'spanning_backups_list_all',
      description:
        'Iterate every backup run for a user/service across all pages and return the full collection. Use sparingly — Spanning enforces 100 req/min.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          userId: { type: 'string', description: 'Spanning user ID.' },
          service: { type: 'string', description: 'Service name.' },
          limit: { type: 'number', description: 'Page size per fetch (1-500, default 100).' },
          maxItems: { type: 'number', description: 'Optional hard cap on items returned.' },
        },
        required: ['userId', 'service'],
      },
    },
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = getClient();
  switch (toolName) {
    case 'spanning_backups_list': {
      const userId = args.userId as string;
      const service = args.service as string;
      const params = {
        limit: args.limit as number | undefined,
        cursor: args.cursor as string | undefined,
      };
      logger.info('API call: backups.list', { userId, service, ...params });
      const result = await client.backups.list(userId, service, params);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
    case 'spanning_backups_list_all': {
      const userId = args.userId as string;
      const service = args.service as string;
      const limit = args.limit as number | undefined;
      const maxItems = (args.maxItems as number | undefined) ?? Infinity;
      const items: unknown[] = [];
      logger.info('API call: backups.listAll', { userId, service, limit, maxItems });
      for await (const item of client.backups.listAll(userId, service, limit ? { limit } : undefined)) {
        items.push(item);
        if (items.length >= maxItems) break;
      }
      return { content: [{ type: 'text', text: JSON.stringify({ count: items.length, items }, null, 2) }] };
    }
    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${toolName}` }], isError: true };
  }
}

export const backupsHandler: DomainHandler = { getTools, handleCall };
