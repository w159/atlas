/**
 * Phishing domain handler
 *
 * Provides tools for KnowBe4 phishing simulation management:
 * - List phishing campaigns
 * - Get phishing campaign details
 * - List phishing security tests (PSTs)
 * - Get PST details
 * - Get PST recipients and their results
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { DomainHandler, CallToolResult } from "../utils/types.js";
import { apiRequest } from "../utils/client.js";
import { logger } from "../utils/logger.js";
import { elicitSelection } from "../utils/elicitation.js";

function getTools(): Tool[] {
  return [
    {
      name: "knowbe4_phishing_campaigns_list",
      description:
        "List all phishing simulation campaigns. Returns campaign names, status, creation dates, and associated security test counts.",
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
      name: "knowbe4_phishing_campaigns_get",
      description:
        "Get detailed information about a specific phishing campaign by ID, including all associated security tests.",
      inputSchema: {
        type: "object" as const,
        properties: {
          campaign_id: {
            type: "number",
            description: "The phishing campaign ID",
          },
        },
        required: ["campaign_id"],
      },
    },
    {
      name: "knowbe4_phishing_security_tests_list",
      description:
        "List all Phishing Security Tests (PSTs) across all campaigns. Returns test status, phish-prone percentage, and recipient counts.",
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
      name: "knowbe4_phishing_campaign_tests",
      description:
        "List all Phishing Security Tests (PSTs) for a specific campaign.",
      inputSchema: {
        type: "object" as const,
        properties: {
          campaign_id: {
            type: "number",
            description: "The phishing campaign ID",
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
        required: ["campaign_id"],
      },
    },
    {
      name: "knowbe4_phishing_security_test_get",
      description:
        "Get detailed results for a specific Phishing Security Test (PST) by ID. Includes phish-prone percentage, clicked/opened/reported counts.",
      inputSchema: {
        type: "object" as const,
        properties: {
          pst_id: {
            type: "number",
            description: "The Phishing Security Test ID",
          },
        },
        required: ["pst_id"],
      },
    },
    {
      name: "knowbe4_phishing_security_test_recipients",
      description:
        "Get recipient-level results for a specific PST. Shows which users clicked, opened, reported, or were otherwise affected.",
      inputSchema: {
        type: "object" as const,
        properties: {
          pst_id: {
            type: "number",
            description: "The Phishing Security Test ID",
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
        required: ["pst_id"],
      },
    },
    {
      name: "knowbe4_phishing_security_test_recipient",
      description:
        "Get a specific recipient's detailed result for a PST, including click time, open time, and reported status.",
      inputSchema: {
        type: "object" as const,
        properties: {
          pst_id: {
            type: "number",
            description: "The Phishing Security Test ID",
          },
          recipient_id: {
            type: "number",
            description: "The recipient (user) ID",
          },
        },
        required: ["pst_id", "recipient_id"],
      },
    },
  ];
}

async function handleCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<CallToolResult> {
  switch (toolName) {
    case "knowbe4_phishing_campaigns_list": {
      const page = (args.page as number) || 1;
      const perPage = (args.per_page as number) || 100;

      logger.info("API call: phishing.campaigns.list", { page, perPage });

      const result = await apiRequest<unknown>("/api/v1/phishing/campaigns", {
        params: { page, per_page: perPage },
      });

      const campaigns = Array.isArray(result) ? result : (result as Record<string, unknown>)?.campaigns ?? result;

      logger.debug("API response: phishing.campaigns.list", {
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

    case "knowbe4_phishing_campaigns_get": {
      const campaignId = args.campaign_id as number;
      if (!campaignId) {
        return {
          content: [{ type: "text", text: "Error: campaign_id is required" }],
          isError: true,
        };
      }

      logger.info("API call: phishing.campaigns.get", { campaignId });

      const result = await apiRequest<unknown>(`/api/v1/phishing/campaigns/${campaignId}`);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "knowbe4_phishing_security_tests_list": {
      const page = (args.page as number) || 1;
      const perPage = (args.per_page as number) || 100;

      logger.info("API call: phishing.securityTests.list", { page, perPage });

      const result = await apiRequest<unknown>("/api/v1/phishing/security_tests", {
        params: { page, per_page: perPage },
      });

      const tests = Array.isArray(result) ? result : (result as Record<string, unknown>)?.security_tests ?? result;

      logger.debug("API response: phishing.securityTests.list", {
        count: Array.isArray(tests) ? tests.length : "unknown",
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ security_tests: tests, page, per_page: perPage }, null, 2),
          },
        ],
      };
    }

    case "knowbe4_phishing_campaign_tests": {
      const campaignId = args.campaign_id as number;
      if (!campaignId) {
        return {
          content: [{ type: "text", text: "Error: campaign_id is required" }],
          isError: true,
        };
      }

      const page = (args.page as number) || 1;
      const perPage = (args.per_page as number) || 100;

      logger.info("API call: phishing.campaignTests", { campaignId, page, perPage });

      const result = await apiRequest<unknown>(`/api/v1/phishing/campaigns/${campaignId}/security_tests`, {
        params: { page, per_page: perPage },
      });

      const tests = Array.isArray(result) ? result : (result as Record<string, unknown>)?.security_tests ?? result;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ security_tests: tests, campaign_id: campaignId, page, per_page: perPage }, null, 2),
          },
        ],
      };
    }

    case "knowbe4_phishing_security_test_get": {
      const pstId = args.pst_id as number;
      if (!pstId) {
        return {
          content: [{ type: "text", text: "Error: pst_id is required" }],
          isError: true,
        };
      }

      logger.info("API call: phishing.securityTest.get", { pstId });

      const result = await apiRequest<unknown>(`/api/v1/phishing/security_tests/${pstId}`);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    case "knowbe4_phishing_security_test_recipients": {
      const pstId = args.pst_id as number;
      if (!pstId) {
        return {
          content: [{ type: "text", text: "Error: pst_id is required" }],
          isError: true,
        };
      }

      const page = (args.page as number) || 1;
      const perPage = (args.per_page as number) || 100;

      logger.info("API call: phishing.securityTest.recipients", { pstId, page, perPage });

      const result = await apiRequest<unknown>(`/api/v1/phishing/security_tests/${pstId}/recipients`, {
        params: { page, per_page: perPage },
      });

      const recipients = Array.isArray(result) ? result : (result as Record<string, unknown>)?.recipients ?? result;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ recipients, pst_id: pstId, page, per_page: perPage }, null, 2),
          },
        ],
      };
    }

    case "knowbe4_phishing_security_test_recipient": {
      const pstId = args.pst_id as number;
      const recipientId = args.recipient_id as number;
      if (!pstId || !recipientId) {
        return {
          content: [{ type: "text", text: "Error: pst_id and recipient_id are required" }],
          isError: true,
        };
      }

      logger.info("API call: phishing.securityTest.recipient", { pstId, recipientId });

      const result = await apiRequest<unknown>(
        `/api/v1/phishing/security_tests/${pstId}/recipients/${recipientId}`
      );

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
        content: [{ type: "text", text: `Unknown phishing tool: ${toolName}` }],
        isError: true,
      };
  }
}

export const phishingHandler: DomainHandler = {
  getTools,
  handleCall,
};
