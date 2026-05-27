import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getNavigationTools, DOMAINS } from './domains/navigation.js';
import { getDomainHandler } from './domains/index.js';
import { getCredentials } from './utils/client.js';
import { logger } from './utils/logger.js';
import type { DomainName } from './utils/types.js';

export function createMcpServer(): Server {
  const server = new Server(
    { name: 'kaseya-spanning-backup-mcp', version: '1.0.0' },
    { capabilities: { tools: {}, logging: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const all = [...getNavigationTools()];
    for (const domain of DOMAINS) {
      const handler = await getDomainHandler(domain);
      all.push(...handler.getTools());
    }
    return { tools: all };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'spanning_navigate') {
      const domain = (args?.domain as string) as DomainName;
      if (!DOMAINS.includes(domain)) {
        return {
          content: [{ type: 'text' as const, text: `Invalid domain: ${domain}. Valid: ${DOMAINS.join(', ')}` }],
          isError: true,
        };
      }
      const handler = await getDomainHandler(domain);
      const tools = handler.getTools();
      const summary = tools.map((t) => `- ${t.name}: ${t.description}`).join('\n');
      return {
        content: [{ type: 'text' as const, text: `${domain} domain\n\nAvailable tools:\n${summary}` }],
      };
    }

    if (name === 'spanning_status') {
      const creds = getCredentials();
      const credStatus = creds
        ? `Configured (adminEmail=${creds.adminEmail}, platform=${creds.platform}, apiUrl=${creds.apiUrl || '(default)'})`
        : 'NOT CONFIGURED — set SPANNING_ADMIN_EMAIL and SPANNING_API_TOKEN';
      return {
        content: [
          {
            type: 'text' as const,
            text: `Kaseya Spanning Backup MCP Server Status\n\nCredentials: ${credStatus}\nDomains: ${DOMAINS.join(', ')}\n\nAll tools are available at all times. Use spanning_navigate to discover tools by domain.`,
          },
        ],
      };
    }

    for (const domain of DOMAINS) {
      const handler = await getDomainHandler(domain);
      const names = handler.getTools().map((t) => t.name);
      if (names.includes(name)) {
        try {
          return await handler.handleCall(name, (args || {}) as Record<string, unknown>);
        } catch (error: any) {
          const status = error?.status ?? error?.statusCode ?? error?.response?.status ?? '';
          const hint = status === 401 || status === 403
            ? 'Verify SPANNING_ADMIN_EMAIL and SPANNING_API_TOKEN environment variables are correct.'
            : 'Check Spanning credentials (SPANNING_ADMIN_EMAIL, SPANNING_API_TOKEN) and platform setting (SPANNING_PLATFORM: m365, gws, or salesforce).';
          const msg = `Spanning API error${status ? ` (HTTP ${status})` : ''}: ${(error as Error).message}. ${hint}`;
          logger.error('Tool call failed', { tool: name, error: msg });
          return {
            content: [{ type: 'text' as const, text: msg }],
            isError: true,
          };
        }
      }
    }

    return {
      content: [{ type: 'text' as const, text: `Unknown tool: ${name}. Use spanning_navigate to discover.` }],
      isError: true,
    };
  });

  return server;
}
