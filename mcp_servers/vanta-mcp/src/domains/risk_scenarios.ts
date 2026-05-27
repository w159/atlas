import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, listTool, getTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    listTool('vanta_risk_scenarios_list', 'List Vanta enterprise risk register scenarios with likelihood, impact, and mitigation status. Use to review the full risk register or find a risk scenario ID for deeper inspection.'),
    getTool('vanta_risk_scenarios_get', 'Get a single Vanta risk scenario by ID (required). Returns risk description, likelihood, impact score, owner, and mitigation plan.', 'id', 'Risk scenario ID'),
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'vanta_risk_scenarios_list':
      logger.info('API call: riskScenarios.list', args);
      return jsonResult(await client.riskScenarios.list(args));
    case 'vanta_risk_scenarios_get':
      return jsonResult(await client.riskScenarios.get(args.id as string));
    default:
      return errorResult(`Unknown tool: ${toolName}`);
  }
}

export const riskScenariosHandler: DomainHandler = { getTools, handleCall };
