import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export type DomainName =
  | 'frameworks'
  | 'controls'
  | 'tests'
  | 'documents'
  | 'integrations'
  | 'people'
  | 'vendors'
  | 'risk_scenarios'
  | 'vulnerabilities'
  | 'policies'
  | 'monitored_computers';

export type CallToolResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
};

export interface DomainHandler {
  getTools(): Tool[];
  handleCall(
    toolName: string,
    args: Record<string, unknown>,
    extra?: unknown
  ): Promise<CallToolResult>;
}
