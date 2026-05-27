/**
 * Organizations domain handler
 *
 * Provides tools for organization operations in NinjaOne.
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { DomainHandler, CallToolResult } from "../utils/types.js";
import { getClient } from "../utils/client.js";
import { logger } from "../utils/logger.js";

/**
 * Get organization domain tools
 */
function getTools(): Tool[] {
  return [
    {
      name: "ninjaone_organizations_list",
      description:
        "List NinjaOne customer organizations (accounts). Returns organization IDs needed to scope device and alert queries.",
      inputSchema: {
        type: "object" as const,
        properties: {
          limit: {
            type: "number",
            description: "Page size — maximum organizations to return in one call (default: 50).",
          },
          cursor: {
            type: "string",
            description: "Opaque pagination cursor from the previous page response.",
          },
        },
      },
    },
    {
      name: "ninjaone_organizations_get",
      description: "Get details of a NinjaOne organization by organization_id (required). Returns name, description, node role, and policy assignment.",
      inputSchema: {
        type: "object" as const,
        properties: {
          organization_id: {
            type: "number",
            description: "Integer NinjaOne organization ID.",
          },
        },
        required: ["organization_id"],
      },
    },
    {
      name: "ninjaone_organizations_create",
      description: "Create a new NinjaOne customer organization (name required). Use when onboarding a new client to the RMM.",
      inputSchema: {
        type: "object" as const,
        properties: {
          name: {
            type: "string",
            description: "Display name for the new organization (customer account).",
          },
          description: {
            type: "string",
            description: "Optional free-text description of the organization.",
          },
          node_approval_mode: {
            type: "string",
            enum: ["AUTOMATIC", "MANUAL", "REJECT"],
            description: "How to handle new device registrations: AUTOMATIC approves all, MANUAL queues for review, REJECT denies.",
          },
          policy_id: {
            type: "number",
            description: "Integer ID of the NinjaOne policy to apply to this organization by default.",
          },
        },
        required: ["name"],
      },
    },
    {
      name: "ninjaone_organizations_locations",
      description: "List physical locations configured for a NinjaOne organization (organization_id required). Returns location names, addresses, and IDs. Use to scope device queries by location.",
      inputSchema: {
        type: "object" as const,
        properties: {
          organization_id: {
            type: "number",
            description: "Integer NinjaOne organization ID (required). Use ninjaone_organizations_list to get IDs.",
          },
        },
        required: ["organization_id"],
      },
    },
    {
      name: "ninjaone_organizations_devices",
      description: "List devices enrolled under a specific NinjaOne organization (organization_id required); optionally filter by device_class. Returns device IDs and hostnames.",
      inputSchema: {
        type: "object" as const,
        properties: {
          organization_id: {
            type: "number",
            description: "Integer NinjaOne organization ID; required to scope results to one customer.",
          },
          device_class: {
            type: "string",
            enum: ["WINDOWS_WORKSTATION", "WINDOWS_SERVER", "MAC", "LINUX", "VMWARE_VM"],
            description: "Filter by device operating system class.",
          },
          limit: {
            type: "number",
            description: "Page size — maximum devices to return in one call (default: 50).",
          },
        },
        required: ["organization_id"],
      },
    },
  ];
}

/**
 * Handle an organization domain tool call
 */
async function handleCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<CallToolResult> {
  const client = await getClient();

  switch (toolName) {
    case "ninjaone_organizations_list": {
      const limit = (args.limit as number) || 50;
      const cursor = args.cursor as string | undefined;
      logger.info("API call: organizations.list", { limit, cursor });

      const organizations = await client.organizations.list({
        pageSize: limit,
        cursor,
      });
      logger.debug("API response: organizations.list", { count: organizations.length });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ organizations }, null, 2),
          },
        ],
      };
    }

    case "ninjaone_organizations_get": {
      const orgId = args.organization_id as number;
      logger.info("API call: organizations.get", { orgId });
      const organization = await client.organizations.get(orgId);
      logger.debug("API response: organizations.get", { organization });

      return {
        content: [{ type: "text", text: JSON.stringify(organization, null, 2) }],
      };
    }

    case "ninjaone_organizations_create": {
      logger.info("API call: organizations.create", { name: args.name });
      const organization = await client.organizations.create({
        name: args.name as string,
        description: args.description as string | undefined,
        nodeApprovalMode: args.node_approval_mode as 'AUTOMATIC' | 'MANUAL' | 'REJECT' | undefined,
        policyId: args.policy_id as number | undefined,
      });
      logger.debug("API response: organizations.create", { organization });

      return {
        content: [{ type: "text", text: JSON.stringify(organization, null, 2) }],
      };
    }

    case "ninjaone_organizations_locations": {
      const orgId = args.organization_id as number;
      logger.info("API call: organizations.getLocations", { orgId });
      const locations = await client.organizations.getLocations(orgId);
      logger.debug("API response: organizations.getLocations", { locations });

      return {
        content: [{ type: "text", text: JSON.stringify(locations, null, 2) }],
      };
    }

    case "ninjaone_organizations_devices": {
      const orgId = args.organization_id as number;
      const limit = (args.limit as number) || 50;
      logger.info("API call: devices.listByOrganization", { orgId, limit, deviceClass: args.device_class });
      const devices = await client.devices.listByOrganization(orgId, {
        pageSize: limit,
      });
      logger.debug("API response: devices.listByOrganization", { devices });

      return {
        content: [{ type: "text", text: JSON.stringify(devices, null, 2) }],
      };
    }

    default:
      return {
        content: [{ type: "text", text: `Unknown organization tool: ${toolName}` }],
        isError: true,
      };
  }
}

export const organizationsHandler: DomainHandler = {
  getTools,
  handleCall,
};
