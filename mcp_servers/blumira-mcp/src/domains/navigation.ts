import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainName, NavigationState } from '../utils/types.js';

const sessionStates = new Map<string, NavigationState>();

export function getState(sessionId: string = 'default'): NavigationState {
  if (!sessionStates.has(sessionId)) {
    sessionStates.set(sessionId, { currentDomain: null });
  }
  return sessionStates.get(sessionId)!;
}

export const DOMAINS: DomainName[] = ['findings', 'agents', 'users', 'msp', 'resolutions'];

export function getNavigationTools(): Tool[] {
  return [
    {
      name: 'blumira_navigate',
      description: `Navigate to a domain to see its tools. Domains: ${DOMAINS.join(', ')}.
- findings: list/search, get, get details, resolve, assign owners, comments
- agents: list devices, get device, list keys, get key
- users: list organization users
- msp: MSP multi-account management — accounts, per-account findings/agents/users
- resolutions: list available resolution options`,
      inputSchema: {
        type: 'object' as const,
        properties: {
          domain: {
            type: 'string',
            enum: DOMAINS,
            description: 'The domain to navigate to',
          },
        },
        required: ['domain'],
      },
    },
    {
      name: 'blumira_status',
      description: 'Check Blumira API connection status and available domains.',
      inputSchema: { type: 'object' as const, properties: {} },
    },
  ];
}

export function getBackTool(): Tool {
  return {
    name: 'blumira_back',
    description: 'Return to the domain navigation menu.',
    inputSchema: { type: 'object' as const, properties: {} },
  };
}
