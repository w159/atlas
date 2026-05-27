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
          userId: { type: 'string', description: 'Spanning user ID (opaque string from spanning_users_list).' },
          service: {
            type: 'string',
            description: 'Service name returned by spanning_services_list (e.g. mail, drive, calendar, contacts).',
          },
          limit: { type: 'number', description: 'Page size — backups per page (integer 1-500, default: 100).' },
          cursor: { type: 'string', description: 'Opaque cursor from the previous page response.' },
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
          userId: { type: 'string', description: 'Spanning user ID (opaque string from spanning_users_list).' },
          service: { type: 'string', description: 'Service name returned by spanning_services_list (e.g. mail, drive, calendar, contacts).' },
          limit: { type: 'number', description: 'Page size per fetch (integer 1-500, default: 100).' },
          maxItems: { type: 'number', description: 'Optional hard cap on total items returned across all pages.' },
        },
        required: ['userId', 'service'],
      },
    },
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  try {
    const client = getClient();
    switch (toolName) {
      case 'spanning_backups_list': {
        const userId = args.userId as string;
        const service = args.service as string;
        if (!userId) return { content: [{ type: 'text', text: 'Error: userId is required (opaque string from spanning_users_list).' }], isError: true };
        if (!service) return { content: [{ type: 'text', text: 'Error: service is required (e.g. mail, drive, calendar, contacts — see spanning_services_list).' }], isError: true };
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
        if (!userId) return { content: [{ type: 'text', text: 'Error: userId is required (opaque string from spanning_users_list).' }], isError: true };
        if (!service) return { content: [{ type: 'text', text: 'Error: service is required (e.g. mail, drive, calendar, contacts — see spanning_services_list).' }], isError: true };
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

export const backupsHandler: DomainHandler = { getTools, handleCall };
