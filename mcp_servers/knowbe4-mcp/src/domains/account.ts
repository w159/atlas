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
        "Get KnowBe4 account information including subscription level, number of seats, admin details, and current risk score.",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
    },
    {
      name: "knowbe4_account_risk_score_history",
      description:
        "Get the account-level risk score history over time. Useful for tracking overall security posture improvement.",
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
  switch (toolName) {
    case "knowbe4_account_get": {
      logger.info("API call: account.get");

      const result = await apiRequest<unknown>("/api/v1/account");

      logger.debug("API response: account.get", {
        hasResult: !!result,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "knowbe4_account_risk_score_history": {
      const page = (args.page as number) || 1;
      const perPage = (args.per_page as number) || 100;

      logger.info("API call: account.riskScoreHistory", { page, perPage });

      const result = await apiRequest<unknown>("/api/v1/account/risk_score_history", {
        params: { page, per_page: perPage },
      });

      const history = Array.isArray(result) ? result : (result as Record<string, unknown>)?.data ?? result;

      logger.debug("API response: account.riskScoreHistory", {
        count: Array.isArray(history) ? history.length : "unknown",
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ risk_score_history: history, page, per_page: perPage }, null, 2),
          },
        ],
      };
    }

    default:
      return {
        content: [{ type: "text", text: `Unknown account tool: ${toolName}` }],
        isError: true,
      };
  }
}

export const accountHandler: DomainHandler = {
  getTools,
  handleCall,
};
