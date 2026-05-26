import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, legacyListTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    legacyListTool(
      'paylocity_lookup_codes_list',
      'List lookup codes for a given resource (e.g. paygroup, EEO, positions, departments). Legacy /api/v2.',
      {
        codeResource: {
          type: 'string',
          description:
            'Code resource name. Common values: paygroup, EEO, positions, departments, supervisor, costCenter1, costCenter2, costCenter3.',
        },
      }
    ),
  ];
}

async function handleCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'paylocity_lookup_codes_list': {
      const { codeResource, ...rest } = args as {
        codeResource?: string;
        [k: string]: unknown;
      };
      if (!codeResource) return errorResult('codeResource is required');
      logger.info('API call: lookupCodes.list', { codeResource });
      return jsonResult(await client.lookupCodes.list(codeResource, rest));
    }
    default:
      return errorResult(`Unknown tool: ${toolName}`);
  }
}

export const lookupCodesHandler: DomainHandler = { getTools, handleCall };
