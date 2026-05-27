/**
 * Account domain handler
 *
 * Provides tools for KnowBe4 account-level information:
 * - Get account details and subscription info
 * - Get account risk score history
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { DomainHandler, CallToolResult } from "../utils/types.js";
import { apiRequest } from "../utils/client.js";
import { logger } from "../utils/logger.js";

function getTools(): Tool[] {
  return [
    {
      name: "knowbe4_account_get",
      description:
        "Retrieve KnowBe4 account details: subscription level, seat count, admin info, and current overall risk score. Use to confirm API connectivity or get high-level account stats.",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
    },
    {
      name: "knowbe4_account_risk_score_history",
      description:
        "Retrieve the KnowBe4 account-level risk score history over time. Returns paginated score snapshots. Use to track security posture improvement trends.",
      inputSchema: {
        type: "object" as const,
        properties: {
          page: {
            type: "number",
            description: "Page number for pagination (default: 1)",
          },
          per_page: {
            type: "number",
            description: "Number of results per page (default: 100, max: 500)",
          },
        },
      },
    },
  ];
}

async function handleCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<CallToolResult> {
  try {
    switch (toolName) {
      case "knowbe4_account_get": {
        logger.info("API call: account.get");
        const result = await apiRequest<unknown>("/v1/account");
        logger.debug("API response: account.get", { hasResult: !!result });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "knowbe4_account_risk_score_history": {
        const page = (args.page as number) || 1;
        const perPage = (args.per_page as number) || 100;
        logger.info("API call: account.riskScoreHistory", { page, perPage });
        const result = await apiRequest<unknown>("/v1/account/risk_score_history", {
          params: { page, per_page: perPage },
        });
        const history = Array.isArray(result) ? result : (result as Record<string, unknown>)?.data ?? result;
        logger.debug("API response: account.riskScoreHistory", {
          count: Array.isArray(history) ? history.length : "unknown",
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ risk_score_history: history, page, per_page: perPage }, null, 2),
          }],
        };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown account tool: ${toolName}` }],
          isError: true,
        };
    }
  } catch (error: any) {
    const status = error?.status ?? error?.statusCode ?? error?.response?.status ?? '';
    const hint = status === 401 || status === 403
      ? 'Verify KNOWBE4_API_KEY is correct and has the required permissions.'
      : status === 429
      ? 'KnowBe4 rate limit hit. Wait before retrying.'
      : 'Check that KNOWBE4_API_KEY is set and KNOWBE4_REGION matches your account region (us, eu, ca, uk, sg, au).';
    const msg = `KnowBe4 API error${status ? ` (HTTP ${status})` : ''}: ${error?.message ?? String(error)}. ${hint}`;
    logger.error("Tool call failed", { tool: toolName, error: msg });
    return { content: [{ type: "text", text: msg }], isError: true };
  }
}

export const accountHandler: DomainHandler = {
  getTools,
  handleCall,
};
