/**
 * Training domain handler
 *
 * Provides tools for KnowBe4 training management:
 * - List and get training campaigns
 * - List and get training enrollments
 * - List and get store purchases
 * - List and get policies
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { DomainHandler, CallToolResult } from "../utils/types.js";
import { apiRequest } from "../utils/client.js";
import { logger } from "../utils/logger.js";
import { elicitSelection } from "../utils/elicitation.js";

function getTools(): Tool[] {
  return [
    {
      name: "knowbe4_training_campaigns_list",
      description:
        "List all training campaigns. Returns campaign names, status, enrollment counts, and completion rates.",
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
      name: "knowbe4_training_campaigns_get",
      description:
        "Get detailed information about a specific training campaign by ID, including modules, enrollments, and completion statistics.",
      inputSchema: {
        type: "object" as const,
        properties: {
          campaign_id: {
            type: "number",
            description: "The training campaign ID",
          },
        },
        required: ["campaign_id"],
      },
    },
    {
      name: "knowbe4_training_enrollments_list",
      description:
        "List all training enrollments. Shows which users are enrolled in which training modules and their completion status.",
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
      name: "knowbe4_training_enrollments_get",
      description:
        "Get detailed information about a specific training enrollment by ID, including module progress and completion date.",
      inputSchema: {
        type: "object" as const,
        properties: {
          enrollment_id: {
            type: "number",
            description: "The enrollment ID",
          },
        },
        required: ["enrollment_id"],
      },
    },
    {
      name: "knowbe4_store_purchases_list",
      description:
        "List all store purchases (training content bought from the KnowBe4 ModStore). Shows purchased modules and content.",
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
      name: "knowbe4_store_purchases_get",
      description:
        "Get detailed information about a specific store purchase by ID.",
      inputSchema: {
        type: "object" as const,
        properties: {
          purchase_id: {
            type: "number",
            description: "The store purchase ID",
          },
        },
        required: ["purchase_id"],
      },
    },
    {
      name: "knowbe4_policies_list",
      description:
        "List all security policies. Returns policy names, status, and acknowledgment requirements.",
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
      name: "knowbe4_policies_get",
      description:
        "Get detailed information about a specific policy by ID, including acknowledgment status.",
      inputSchema: {
        type: "object" as const,
        properties: {
          policy_id: {
            type: "number",
            description: "The policy ID",
          },
        },
        required: ["policy_id"],
      },
    },
  ];
}

async function handleCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<CallToolResult> {
  switch (toolName) {
    case "knowbe4_training_campaigns_list": {
      const page = (args.page as number) || 1;
      const perPage = (args.per_page as number) || 100;

      logger.info("API call: training.campaigns.list", { page, perPage });

      const result = await apiRequest<unknown>("/api/v1/training/campaigns", {
        params: { page, per_page: perPage },
      });

      const campaigns = Array.isArray(result) ? result : (result as Record<string, unknown>)?.campaigns ?? result;

      logger.debug("API response: training.campaigns.list", {
        count: Array.isArray(campaigns) ? campaigns.length : "unknown",
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ campaigns, page, per_page: perPage }, null, 2),
          },
        ],
      };
    }

    case "knowbe4_training_campaigns_get": {
      const campaignId = args.campaign_id as number;
      if (!campaignId) {
        return {
          content: [{ type: "text", text: "Error: campaign_id is required" }],
          isError: true,
        };
      }

      logger.info("API call: training.campaigns.get", { campaignId });

      const result = await apiRequest<unknown>(`/api/v1/training/campaigns/${campaignId}`);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "knowbe4_training_enrollments_list": {
      const page = (args.page as number) || 1;
      const perPage = (args.per_page as number) || 100;

      logger.info("API call: training.enrollments.list", { page, perPage });

      const result = await apiRequest<unknown>("/api/v1/training/enrollments", {
        params: { page, per_page: perPage },
      });

      const enrollments = Array.isArray(result) ? result : (result as Record<string, unknown>)?.enrollments ?? result;

      logger.debug("API response: training.enrollments.list", {
        count: Array.isArray(enrollments) ? enrollments.length : "unknown",
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ enrollments, page, per_page: perPage }, null, 2),
          },
        ],
      };
    }

    case "knowbe4_training_enrollments_get": {
      const enrollmentId = args.enrollment_id as number;
      if (!enrollmentId) {
        return {
          content: [{ type: "text", text: "Error: enrollment_id is required" }],
          isError: true,
        };
      }

      logger.info("API call: training.enrollments.get", { enrollmentId });

      const result = await apiRequest<unknown>(`/api/v1/training/enrollments/${enrollmentId}`);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "knowbe4_store_purchases_list": {
      const page = (args.page as number) || 1;
      const perPage = (args.per_page as number) || 100;

      logger.info("API call: store.purchases.list", { page, perPage });

      const result = await apiRequest<unknown>("/api/v1/store/purchases", {
        params: { page, per_page: perPage },
      });

      const purchases = Array.isArray(result) ? result : (result as Record<string, unknown>)?.purchases ?? result;

      logger.debug("API response: store.purchases.list", {
        count: Array.isArray(purchases) ? purchases.length : "unknown",
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ purchases, page, per_page: perPage }, null, 2),
          },
        ],
      };
    }

    case "knowbe4_store_purchases_get": {
      const purchaseId = args.purchase_id as number;
      if (!purchaseId) {
        return {
          content: [{ type: "text", text: "Error: purchase_id is required" }],
          isError: true,
        };
      }

      logger.info("API call: store.purchases.get", { purchaseId });

      const result = await apiRequest<unknown>(`/api/v1/store/purchases/${purchaseId}`);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "knowbe4_policies_list": {
      const page = (args.page as number) || 1;
      const perPage = (args.per_page as number) || 100;

      logger.info("API call: policies.list", { page, perPage });

      const result = await apiRequest<unknown>("/api/v1/policies", {
        params: { page, per_page: perPage },
      });

      const policies = Array.isArray(result) ? result : (result as Record<string, unknown>)?.policies ?? result;

      logger.debug("API response: policies.list", {
        count: Array.isArray(policies) ? policies.length : "unknown",
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ policies, page, per_page: perPage }, null, 2),
          },
        ],
      };
    }

    case "knowbe4_policies_get": {
      const policyId = args.policy_id as number;
      if (!policyId) {
        return {
          content: [{ type: "text", text: "Error: policy_id is required" }],
          isError: true,
        };
      }

      logger.info("API call: policies.get", { policyId });

      const result = await apiRequest<unknown>(`/api/v1/policies/${policyId}`);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    default:
      return {
        content: [{ type: "text", text: `Unknown training tool: ${toolName}` }],
        isError: true,
      };
  }
}

export const trainingHandler: DomainHandler = {
  getTools,
  handleCall,
};
