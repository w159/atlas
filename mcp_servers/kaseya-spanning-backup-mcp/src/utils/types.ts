import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export type DomainName =
  | 'users'
  | 'services'
  | 'backups'
  | 'restores'
  | 'audit'
  | 'license';

export type CallToolResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
};

export interface DomainHandler {
  getTools(): Tool[];
  handleCall(
    toolName: string,
    args: Record<string, unknown>
  ): Promise<CallToolResult>;
}
