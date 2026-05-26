/**
 * Users domain handler
 *
 * Provides tools for KnowBe4 user management:
 * - List users with filtering
 * - Get user details
 * - Get user risk score history
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { DomainHandler, CallToolResult } from "../utils/types.js";
import { apiRequest } from "../utils/client.js";
import { logger } from "../utils/logger.js";
import { elicitText, elicitSelection } from "../utils/elicitation.js";

function getTools(): Tool[] {
  return [
    {
      name: "knowbe4_users_list",
      description:
        "List KnowBe4 users with optional filtering by status or group. Returns paginated results including email, name, risk score, and department.",
      inputSchema: {
        type: "object" as const,
        properties: {
          status: {
            type: "string",
            enum: ["active", "archived"],
            description: "Filter by user status (active or archived)",
          },
          group_id: {
            type: "number",
            description: "Filter by group ID to list only members of a specific group",
          },
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
    {
      name: "knowbe4_users_get",
      description:
        "Get detailed information about a specific KnowBe4 user by ID, including their risk score, phish-prone percentage, training status, and group memberships.",
      inputSchema: {
        type: "object" as const,
        properties: {
          user_id: {
            type: "number",
            description: "The user ID to retrieve",
          },
        },
        required: ["user_id"],
      },
    },
    {
      name: "knowbe4_users_risk_score_history",
      description:
        "Get a specific user's risk score history over time. Useful for tracking individual improvement in security awareness.",
      inputSchema: {
        type: "object" as const,
        properties: {
          user_id: {
            type: "number",
            description: "The user ID to get risk score history for",
          },
          page: {
            type: "number",
            description: "Page number for pagination (default: 1)",
          },
          per_page: {
            type: "number",
            description: "Number of results per page (default: 100, max: 500)",
          },
        },
        required: ["user_id"],
      },
    },
  ];
}

async function handleCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<CallToolResult> {
  switch (toolName) {
    case "knowbe4_users_list": {
      const page = (args.page as number) || 1;
      const perPage = (args.per_page as number) || 100;
      let status = args.status as string | undefined;
      const groupId = args.group_id as number | undefined;

      // If no filters provided, ask the user what they want to see
      if (!status && !groupId) {
        const filterChoice = await elicitSelection(
          "No filters specified. Would you like to filter users?",
          "filter",
          [
            { value: "active", label: "Active users only" },
            { value: "archived", label: "Archived users only" },
            { value: "all", label: "All users" },
          ]
        );
        if (filterChoice && filterChoice !== "all") {
          status = filterChoice;
        }
      }

      logger.info("API call: users.list", { page, perPage, status, groupId });

      const params: Record<string, string | number | boolean | undefined> = {
        page,
        per_page: perPage,
      };
      if (status) params.status = status;
      if (groupId) params.group_id = groupId;

      const result = await apiRequest<unknown>("/api/v1/users", { params });

      const users = Array.isArray(result) ? result : (result as Record<string, unknown>)?.users ?? result;

      logger.debug("API response: users.list", {
        count: Array.isArray(users) ? users.length : "unknown",
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ users, page, per_page: perPage }, null, 2),
          },
        ],
      };
    }

    case "knowbe4_users_get": {
      const userId = args.user_id as number;
      if (!userId) {
        return {
          content: [{ type: "text", text: "Error: user_id is required" }],
          isError: true,
        };
      }

      logger.info("API call: users.get", { userId });

      const result = await apiRequest<unknown>(`/api/v1/users/${userId}`);

      logger.debug("API response: users.get", { userId });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "knowbe4_users_risk_score_history": {
      const userId = args.user_id as number;
      if (!userId) {
        return {
          content: [{ type: "text", text: "Error: user_id is required" }],
          isError: true,
        };
      }

      const page = (args.page as number) || 1;
      const perPage = (args.per_page as number) || 100;

      logger.info("API call: users.riskScoreHistory", { userId, page, perPage });

      const result = await apiRequest<unknown>(`/api/v1/users/${userId}/risk_score_history`, {
        params: { page, per_page: perPage },
      });

      const history = Array.isArray(result) ? result : (result as Record<string, unknown>)?.data ?? result;

      logger.debug("API response: users.riskScoreHistory", {
        count: Array.isArray(history) ? history.length : "unknown",
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ risk_score_history: history, user_id: userId, page, per_page: perPage }, null, 2),
          },
        ],
      };
    }

    default:
      return {
        content: [{ type: "text", text: `Unknown users tool: ${toolName}` }],
        isError: true,
      };
  }
}

export const usersHandler: DomainHandler = {
  getTools,
  handleCall,
};
