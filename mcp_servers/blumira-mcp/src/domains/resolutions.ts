import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';

function getTools(): Tool[] {
  return [
    {
      name: 'blumira_resolutions_list',
      description: 'List all Blumira finding resolution codes and labels. Use to confirm valid resolution IDs before calling blumira_findings_resolve.',
      inputSchema: {
        type: 'object' as const,
        properties: {},
      },
    },
  ];
}

async function handleCall(toolName: string, _args: Record<string, unknown>): Promise<CallToolResult> {
  try {
    const client = await getClient();

    switch (toolName) {
      case 'blumira_resolutions_list': {
        logger.info('API call: resolutions.list');
        const res = await client.resolutions.list();
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

export const resolutionsHandler: DomainHandler = { getTools, handleCall };
