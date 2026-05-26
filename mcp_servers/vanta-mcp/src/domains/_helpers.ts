import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { CallToolResult } from '../utils/types.js';

export function jsonResult(data: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

export function errorResult(msg: string): CallToolResult {
  return { content: [{ type: 'text', text: msg }], isError: true };
}

/** Common pagination args shared by every *_list tool. */
export const paginationProps = {
  pageSize: { type: 'number', description: 'Page size (default 25, max usually 100).' },
  pageCursor: { type: 'string', description: 'Opaque cursor returned by a previous page as endCursor.' },
};

export function listTool(name: string, description: string, extraProps: Record<string, unknown> = {}): Tool {
  return {
    name,
    description,
    inputSchema: {
      type: 'object' as const,
      properties: { ...paginationProps, ...extraProps },
    },
  };
}

export function getTool(name: string, description: string, idName = 'id', idDesc = 'Resource ID'): Tool {
  return {
    name,
    description,
    inputSchema: {
      type: 'object' as const,
      properties: {
        [idName]: { type: 'string', description: idDesc },
      },
      required: [idName],
    },
  };
}
