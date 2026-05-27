import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'blumira_users_list',
      description: 'List Blumira organization users. Returns user UUIDs, emails, names, and roles. Use to look up sender/owner UUIDs before assigning findings or adding comments.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          page: { type: 'number', description: 'Page number for pagination (default: 1).' },
          page_size: { type: 'number', description: 'Results per page (default: 100).' },
          limit: { type: 'number', description: 'Maximum total records to return (max: 5000).' },
          order_by: { type: 'string', description: 'Sort field and direction, e.g. "email;asc" or "created;desc".' },
        },
      },
    },
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  try {
    const client = await getClient();

    switch (toolName) {
      case 'blumira_users_list': {
        logger.info('API call: users.list', args);
        const res = await client.users.list(args as any);
        return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
      }
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${toolName}` }], isError: true };
    }
  } catch (error: any) {
    const status = error?.status ?? error?.statusCode ?? '';
    const hint = status === 401 || status === 403
      ? 'Verify BLUMIRA_JWT_TOKEN or BLUMIRA_CLIENT_ID + BLUMIRA_CLIENT_SECRET are correct.'
      : 'Check that your Blumira credentials are valid and the API is reachable.';
    const msg = `Blumira API error${status ? ` (HTTP ${status})` : ''}: ${error?.message ?? String(error)}. ${hint}`;
    logger.error('Tool call failed', { tool: toolName, error: msg });
    return { content: [{ type: 'text' as const, text: msg }], isError: true };
  }
}

export const usersHandler: DomainHandler = { getTools, handleCall };
