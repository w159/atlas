import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, listTool, getTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    listTool('vanta_vulnerabilities_list', 'List discovered vulnerabilities with SLA + fix availability.', {
      q: { type: 'string', description: 'Free-text query (CVE, package name, etc.).' },
      isFixAvailable: { type: 'boolean', description: 'Only return vulns where a fix is published.' },
    }),
    getTool('vanta_vulnerabilities_get', 'Get a single vulnerability by ID.', 'id', 'Vulnerability ID'),
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'vanta_vulnerabilities_list':
      logger.info('API call: vulnerabilities.list', args);
      return jsonResult(await client.vulnerabilities.list(args));
    case 'vanta_vulnerabilities_get':
      return jsonResult(await client.vulnerabilities.get(args.id as string));
    default:
      return errorResult(`Unknown tool: ${toolName}`);
  }
}

export const vulnerabilitiesHandler: DomainHandler = { getTools, handleCall };
