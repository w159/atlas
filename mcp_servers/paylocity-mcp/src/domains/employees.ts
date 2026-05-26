import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, modernListTool, getTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    modernListTool(
      'paylocity_employees_list',
      'List employees from the modern CoreHR API. Supports cursor pagination and expansion fields.',
      {
        include: {
          type: 'string',
          description:
            'CSV of expansion fields. Allowed: info, position, status, payRate, futurePayRate.',
        },
        activeOnly: {
          type: 'boolean',
          description: 'When true, only return active employees.',
        },
        testMode: {
          type: 'boolean',
          description: 'Optional Paylocity test-mode flag.',
        },
      }
    ),
    getTool(
      'paylocity_employees_get',
      'Get a single employee by ID (modern CoreHR).',
      {
        employeeId: { type: 'string', description: 'Paylocity employeeId' },
        include: {
          type: 'string',
          description:
            'CSV of expansion fields (info, position, status, payRate, futurePayRate).',
        },
      },
      ['employeeId']
    ),
  ];
}

async function handleCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'paylocity_employees_list': {
      logger.info('API call: employees.list', args);
      return jsonResult(await client.employees.list(args));
    }
    case 'paylocity_employees_get': {
      const { employeeId, ...rest } = args as { employeeId: string; [k: string]: unknown };
      logger.info('API call: employees.get', { employeeId });
      return jsonResult(await client.employees.get(employeeId, rest));
    }
    default:
      return errorResult(`Unknown tool: ${toolName}`);
  }
}

export const employeesHandler: DomainHandler = { getTools, handleCall };
