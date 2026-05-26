import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, listTool, getTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    listTool('vanta_tests_list', 'List automated control tests with status (OK, NEEDS_ATTENTION, DEACTIVATED).', {
      statusFilter: { type: 'string', description: 'Status filter (e.g. NEEDS_ATTENTION).' },
      frameworkFilter: { type: 'string', description: 'Framework ID to restrict tests to.' },
    }),
    getTool('vanta_tests_get', 'Get a single test by ID.', 'id', 'Test ID'),
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'vanta_tests_list':
      logger.info('API call: tests.list', args);
      return jsonResult(await client.tests.list(args));
    case 'vanta_tests_get':
      logger.info('API call: tests.get', { id: args.id });
      return jsonResult(await client.tests.get(args.id as string));
    default:
      return errorResult(`Unknown tool: ${toolName}`);
  }
}

export const testsHandler: DomainHandler = { getTools, handleCall };
