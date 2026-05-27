import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'spanning_users_list',
      description: 'List Spanning backed-up users (one page). Returns user IDs and backup status. Cursor-paginated — pass cursor from previous response to get next page.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          limit: { type: 'number', description: 'Page size — users per page (integer 1-500, default: 100).' },
          cursor: { type: 'string', description: 'Opaque cursor returned from the previous page response.' },
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
          limit: { type: 'number', description: 'Page size per fetch (integer 1-500, default: 100).' },
          maxItems: { type: 'number', description: 'Optional hard cap on total items returned across all pages.' },
        },
      },
    },
    {
      name: 'spanning_users_get',
      description: 'Get a single Spanning backed-up user by userId (required). Returns backup enabled state, email, and per-service summary.',
      inputSchema: {
        type: 'object' as const,
        properties: { userId: { type: 'string', description: 'Spanning user ID.' } },
        required: ['userId'],
      },
    },
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  try {
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
        if (!userId) return { content: [{ type: 'text', text: 'Error: userId is required (opaque string from spanning_users_list).' }], isError: true };
        logger.info('API call: users.get', { userId });
        const user = await client.users.get(userId);
        return { content: [{ type: 'text', text: JSON.stringify(user, null, 2) }] };
      }
      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${toolName}` }], isError: true };
    }
  } catch (error: any) {
    const status = error?.status ?? error?.statusCode ?? '';
    const hint = status === 401 || status === 403
      ? 'Verify SPANNING_ADMIN_EMAIL and SPANNING_API_TOKEN environment variables are correct.'
      : 'Check Spanning API credentials (SPANNING_ADMIN_EMAIL, SPANNING_API_TOKEN) and platform setting (SPANNING_PLATFORM).';
    const msg = `Spanning API error${status ? ` (HTTP ${status})` : ''}: ${error?.message ?? String(error)}. ${hint}`;
    logger.error('Tool call failed', { tool: toolName, error: msg });
    return { content: [{ type: 'text', text: msg }], isError: true };
  }
}

export const usersHandler: DomainHandler = { getTools, handleCall };
