import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { CallToolResult } from '../utils/types.js';

export function jsonResult(data: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

export function errorResult(msg: string): CallToolResult {
  return { content: [{ type: 'text', text: msg }], isError: true };
}

/**
 * Modern (CoreHR / API Hub) pagination args shared by every modern *_list
 * tool. Paylocity caps `limit` at 20.
 */
export const modernPaginationProps = {
  limit: {
    type: 'number',
    description: 'Page size (max 20 for Paylocity cursor endpoints).',
  },
  nextToken: {
    type: 'string',
    description: 'Opaque cursor from the previous page (pagination.nextToken).',
  },
};

/** Optional companyId override common to every tool. */
export const companyIdProp = {
  companyId: {
    type: 'string',
    description:
      'Override the default companyId for this call (defaults to PAYLOCITY_COMPANY_ID env var).',
  },
};

export function modernListTool(
  name: string,
  description: string,
  extraProps: Record<string, unknown> = {}
): Tool {
  return {
    name,
    description,
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...modernPaginationProps,
        ...companyIdProp,
        ...extraProps,
      },
    },
  };
}

export function legacyListTool(
  name: string,
  description: string,
  extraProps: Record<string, unknown> = {}
): Tool {
  return {
    name,
    description,
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...companyIdProp,
        ...extraProps,
      },
    },
  };
}

export function getTool(
  name: string,
  description: string,
  extraProps: Record<string, unknown> = {},
  required: string[] = []
): Tool {
  return {
    name,
    description,
    inputSchema: {
      type: 'object' as const,
      properties: {
        ...companyIdProp,
        ...extraProps,
      },
      required,
    },
  };
}
