import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'spanning_users_list',
      description: 'List backed-up users (single page). Cursor-paginated.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          limit: { type: 'number', description: 'Page size (1-500, default 100).' },
          cursor: { type: 'string', description: 'Cursor returned from the previous page.' },
        },
      },
    },
    {
      name: 'spanning_users_list_all',
      description:
        'Iterate every backed-up user across all pages and return the full collection. Use sparingly on large tenants — Spanning enforces 100 req/min.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          limit: { type: 'number', description: 'Page size per fetch (1-500, default 100).' },
          maxItems: { type: 'number', description: 'Optional hard cap on items returned.' },
        },
      },
    },
    {
      name: 'spanning_users_get',
      description: 'Get a single backed-up user by ID.',
      inputSchema: {
        type: 'object' as const,
        properties: { userId: { type: 'string', description: 'Spanning user ID.' } },
        required: ['userId'],
      },
    },
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = getClient();
  switch (toolName) {
    case 'spanning_users_list': {
      const params = {
        limit: args.limit as number | undefined,
        cursor: args.cursor as string | undefined,
      };
      logger.info('API call: users.list', params);
      const result = await client.users.list(params);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
    case 'spanning_users_list_all': {
      const limit = args.limit as number | undefined;
      const maxItems = (args.maxItems as number | undefined) ?? Infinity;
      const items: unknown[] = [];
      logger.info('API call: users.listAll', { limit, maxItems });
      for await (const item of client.users.listAll(limit ? { limit } : undefined)) {
        items.push(item);
        if (items.length >= maxItems) break;
      }
      return { content: [{ type: 'text', text: JSON.stringify({ count: items.length, items }, null, 2) }] };
    }
    case 'spanning_users_get': {
      const userId = args.userId as string;
      logger.info('API call: users.get', { userId });
      const user = await client.users.get(userId);
      return { content: [{ type: 'text', text: JSON.stringify(user, null, 2) }] };
    }
    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${toolName}` }], isError: true };
  }
}

export const usersHandler: DomainHandler = { getTools, handleCall };
