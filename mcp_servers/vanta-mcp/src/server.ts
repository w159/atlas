import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { getNavigationTools, DOMAINS } from './domains/navigation.js';
import { getDomainHandler } from './domains/index.js';
import { getCredentials } from './utils/client.js';
import { logger } from './utils/logger.js';
import type { DomainName } from './utils/types.js';

export function createMcpServer(): Server {
  const server = new Server(
    { name: 'vanta-mcp', version: '0.1.0' },
    {
      capabilities: {
        tools: {},
        logging: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const allTools = [...getNavigationTools()];
    for (const domain of DOMAINS) {
      const handler = await getDomainHandler(domain);
      allTools.push(...handler.getTools());
    }
    return { tools: allTools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
    const { name, arguments: args } = request.params;

    if (name === 'vanta_navigate') {
      const domain = (args?.domain as string) as DomainName;
      if (!DOMAINS.includes(domain)) {
        return {
          content: [{ type: 'text' as const, text: `Invalid domain: ${domain}. Valid: ${DOMAINS.join(', ')}` }],
          isError: true,
        };
      }
      const handler = await getDomainHandler(domain);
      const tools = handler.getTools();
      const toolSummary = tools.map(t => `- ${t.name}: ${t.description}`).join('\n');
      return {
        content: [{
          type: 'text' as const,
          text: `Domain: ${domain}\n\nAvailable tools:\n${toolSummary}\n\nYou can call any of these tools directly.`,
        }],
      };
    }

    if (name === 'vanta_status') {
      const creds = getCredentials();
      const credStatus = creds
        ? `Configured (clientId=${creds.clientId.slice(0, 6)}…, baseUrl=${creds.baseUrl || 'https://api.vanta.com/v1 (default)'})`
        : 'NOT CONFIGURED — set VANTA_CLIENT_ID and VANTA_CLIENT_SECRET';
      return {
        content: [{
          type: 'text' as const,
          text: `Vanta MCP Server Status\n\nCredentials: ${credStatus}\nDomains: ${DOMAINS.join(', ')}\n\nAll tools are registered upfront. Use vanta_navigate to discover tools by domain.`,
        }],
      };
    }

    for (const domain of DOMAINS) {
      const handler = await getDomainHandler(domain);
      const toolNames = handler.getTools().map(t => t.name);
      if (toolNames.includes(name)) {
        try {
          return await handler.handleCall(name, (args || {}) as Record<string, unknown>, extra);
        } catch (error) {
          logger.error('Tool call failed', { tool: name, error: (error as Error).message });
          return {
            content: [{ type: 'text' as const, text: `Error: ${(error as Error).message}` }],
            isError: true,
          };
        }
      }
    }

    return {
      content: [{ type: 'text' as const, text: `Unknown tool: ${name}. Use vanta_navigate to discover available tools.` }],
      isError: true,
    };
  });

  return server;
}
