import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, modernListTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    modernListTool(
      'paylocity_pay_grades_list',
      'List the pay-grade catalog (modern Position Management).'
    ),
  ];
}

async function handleCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'paylocity_pay_grades_list':
      logger.info('API call: payGrades.list', args);
      return jsonResult(await client.payGrades.list(args));
    default:
      return errorResult(`Unknown tool: ${toolName}`);
  }
}

export const payGradesHandler: DomainHandler = { getTools, handleCall };
