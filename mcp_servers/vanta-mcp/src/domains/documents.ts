import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { logger } from '../utils/logger.js';
import { jsonResult, errorResult, listTool, getTool } from './_helpers.js';

function getTools(): Tool[] {
  return [
    listTool('vanta_documents_list', 'List Vanta evidence documents (policies, training records, attestations); filter by frameworkMatchesAny (array of framework IDs) or statusMatchesAny (CURRENT, EXPIRING, MISSING). Use to find evidence gaps or documents approaching expiry for an audit.', {
      frameworkMatchesAny: { type: 'array', items: { type: 'string' }, description: 'Filter to documents tagged for any of these framework IDs.' },
      statusMatchesAny:   { type: 'array', items: { type: 'string' }, description: 'Filter by document status (e.g. CURRENT, EXPIRING, MISSING).' },
    }),
    getTool('vanta_documents_get', 'Get a single Vanta evidence document by ID (required). Returns document type, status, expiry date, and linked controls.', 'id', 'Document ID'),
  ];
}

async function handleCall(toolName: string, args: Record<string, unknown>): Promise<CallToolResult> {
  const client = await getClient();
  switch (toolName) {
    case 'vanta_documents_list':
      logger.info('API call: documents.list', args);
      return jsonResult(await client.documents.list(args));
    case 'vanta_documents_get':
      logger.info('API call: documents.get', { id: args.id });
      return jsonResult(await client.documents.get(args.id as string));
    default:
      return errorResult(`Unknown tool: ${toolName}`);
  }
}

export const documentsHandler: DomainHandler = { getTools, handleCall };
