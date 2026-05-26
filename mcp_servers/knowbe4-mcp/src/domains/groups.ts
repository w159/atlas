/**
 * Groups domain handler
 *
 * Provides tools for KnowBe4 group management:
 * - List groups
 * - Get group details
 * - Get group members
 * - Get group risk score history
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { DomainHandler, CallToolResult } from "../utils/types.js";
import { apiRequest } from "../utils/client.js";
import { logger } from "../utils/logger.js";
import { elicitText } from "../utils/elicitation.js";

function getTools(): Tool[] {
  return [
    {
      name: "knowbe4_groups_list",
      description:
        "List all KnowBe4 groups. Returns group names, member counts, and current risk scores.",
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
    {
      name: "knowbe4_groups_get",
      description:
        "Get detailed information about a specific KnowBe4 group by ID, including risk score and member count.",
      inputSchema: {
        type: "object" as const,
        properties: {
          group_id: {
            type: "number",
            description: "The group ID to retrieve",
          },
        },
        required: ["group_id"],
      },
    },
    {
      name: "knowbe4_groups_members",
      description:
        "Get all members of a specific group. Returns user details for each member.",
      inputSchema: {
        type: "object" as const,
        properties: {
          group_id: {
            type: "number",
            description: "The group ID to get members for",
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
        required: ["group_id"],
      },
    },
    {
      name: "knowbe4_groups_risk_score_history",
      description:
        "Get a group's risk score history over time. Useful for comparing security posture across departments or teams.",
      inputSchema: {
        type: "object" as const,
        properties: {
          group_id: {
            type: "number",
            description: "The group ID to get risk score history for",
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
        required: ["group_id"],
      },
    },
  ];
}

async function handleCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<CallToolResult> {
  switch (toolName) {
    case "knowbe4_groups_list": {
      const page = (args.page as number) || 1;
      const perPage = (args.per_page as number) || 100;

      logger.info("API call: groups.list", { page, perPage });

      const result = await apiRequest<unknown>("/api/v1/groups", {
        params: { page, per_page: perPage },
      });

      const groups = Array.isArray(result) ? result : (result as Record<string, unknown>)?.groups ?? result;

      logger.debug("API response: groups.list", {
        count: Array.isArray(groups) ? groups.length : "unknown",
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ groups, page, per_page: perPage }, null, 2),
          },
        ],
      };
    }

    case "knowbe4_groups_get": {
      const groupId = args.group_id as number;
      if (!groupId) {
        return {
          content: [{ type: "text", text: "Error: group_id is required" }],
          isError: true,
        };
      }

      logger.info("API call: groups.get", { groupId });

      const result = await apiRequest<unknown>(`/api/v1/groups/${groupId}`);

      logger.debug("API response: groups.get", { groupId });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "knowbe4_groups_members": {
      const groupId = args.group_id as number;
      if (!groupId) {
        return {
          content: [{ type: "text", text: "Error: group_id is required" }],
          isError: true,
        };
      }

      const page = (args.page as number) || 1;
      const perPage = (args.per_page as number) || 100;

      logger.info("API call: groups.members", { groupId, page, perPage });

      const result = await apiRequest<unknown>(`/api/v1/groups/${groupId}/members`, {
        params: { page, per_page: perPage },
      });

      const members = Array.isArray(result) ? result : (result as Record<string, unknown>)?.members ?? result;

      logger.debug("API response: groups.members", {
        count: Array.isArray(members) ? members.length : "unknown",
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ members, group_id: groupId, page, per_page: perPage }, null, 2),
          },
        ],
      };
    }

    case "knowbe4_groups_risk_score_history": {
      const groupId = args.group_id as number;
      if (!groupId) {
        return {
          content: [{ type: "text", text: "Error: group_id is required" }],
          isError: true,
        };
      }

      const page = (args.page as number) || 1;
      const perPage = (args.per_page as number) || 100;

      logger.info("API call: groups.riskScoreHistory", { groupId, page, perPage });

      const result = await apiRequest<unknown>(`/api/v1/groups/${groupId}/risk_score_history`, {
        params: { page, per_page: perPage },
      });

      const history = Array.isArray(result) ? result : (result as Record<string, unknown>)?.data ?? result;

      logger.debug("API response: groups.riskScoreHistory", {
        count: Array.isArray(history) ? history.length : "unknown",
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ risk_score_history: history, group_id: groupId, page, per_page: perPage }, null, 2),
          },
        ],
      };
    }

    default:
      return {
        content: [{ type: "text", text: `Unknown groups tool: ${toolName}` }],
        isError: true,
      };
  }
}

export const groupsHandler: DomainHandler = {
  getTools,
  handleCall,
};
