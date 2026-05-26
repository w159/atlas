import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, listTool, getTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    listTool('vanta_frameworks_list', 'List compliance frameworks the workspace is tracking (SOC 2, ISO 27001, etc.).'),
    getTool('vanta_frameworks_get', 'Get a single framework by ID.', 'id', 'Framework ID'),
    {
      name: 'vanta_frameworks_list_controls',
      description: 'List the controls scoped to a specific framework.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          id: { type: 'string', description: 'Framework ID' },
          pageSize: { type: 'number' },
          pageCursor: { type: 'string' },
        },
        required: ['id'],
      },
    },
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'vanta_frameworks_list': {
      logger.info('API call: frameworks.list', args);
      const page = await client.frameworks.list(args);
      return jsonResult(page);
    }
    case 'vanta_frameworks_get': {
      const id = args.id as string;
      logger.info('API call: frameworks.get', { id });
      return jsonResult(await client.frameworks.get(id));
    }
    case 'vanta_frameworks_list_controls': {
      const { id, ...rest } = args as { id: string; [k: string]: unknown };
      logger.info('API call: frameworks.listControls', { id, ...rest });
      return jsonResult(await client.frameworks.listControls(id, rest));
    }
    default:
      return errorResult(`Unknown tool: ${toolName}`);
  }
}

export const frameworksHandler: DomainHandler = { getTools, handleCall };
