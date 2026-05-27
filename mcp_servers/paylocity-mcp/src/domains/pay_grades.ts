import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, modernListTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    modernListTool(
      'paylocity_pay_grades_list',
      'List Paylocity pay grades (Position Management Modern API). Returns grade IDs and min/mid/max ranges. Use to map employee positions to their compensation band — combine with paylocity_employees_get to audit pay equity.'
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
