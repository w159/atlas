import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'spanning_services_list',
      description:
        'List the backed-up services for one user (e.g. mail, drive, calendar, contacts). Tells you what is actually protected for that account.',
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
      case 'spanning_services_list': {
        const userId = args.userId as string;
        if (!userId) return { content: [{ type: 'text', text: 'Error: userId is required (opaque string from spanning_users_list).' }], isError: true };
        logger.info('API call: services.list', { userId });
        const result = await client.services.list(userId);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
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

export const servicesHandler: DomainHandler = { getTools, handleCall };
