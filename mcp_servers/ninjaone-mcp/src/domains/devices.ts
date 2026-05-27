/**
 * Devices domain handler
 *
 * Provides tools for device operations in NinjaOne.
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { DomainHandler, CallToolResult } from "../utils/types.js";
import { getClient } from "../utils/client.js";
import { logger } from "../utils/logger.js";
import { elicitSelection } from "../utils/elicitation.js";

/**
 * Get device domain tools
 */
function getTools(): Tool[] {
  return [
    {
      name: "ninjaone_devices_list",
      description:
        "List NinjaOne RMM devices; filter by organization_id, device_class (WINDOWS_WORKSTATION/SERVER/MAC/LINUX/VMWARE_VM), or online status. Returns device IDs needed by other device tools.",
      inputSchema: {
        type: "object" as const,
        properties: {
          organization_id: {
            type: "number",
            description: "Integer NinjaOne organization ID; scopes results to one customer account.",
          },
          device_class: {
            type: "string",
            enum: ["WINDOWS_WORKSTATION", "WINDOWS_SERVER", "MAC", "LINUX", "VMWARE_VM"],
            description: "Filter by device operating system class.",
          },
          online: {
            type: "boolean",
            description: "When true, returns only currently online devices; false returns only offline devices.",
          },
          limit: {
            type: "number",
            description: "Page size — maximum devices to return in one call (default: 50).",
          },
          cursor: {
            type: "string",
            description: "Opaque pagination cursor from the previous page response.",
          },
        },
      },
    },
    {
      name: "ninjaone_devices_get",
      description: "Get full details of a NinjaOne device by device_id (required): OS, hostname, IP addresses, last-contact time, and policy assignment.",
      inputSchema: {
        type: "object" as const,
        properties: {
          device_id: {
            type: "number",
            description: "Integer NinjaOne device ID.",
          },
        },
        required: ["device_id"],
      },
    },
    {
      name: "ninjaone_devices_reboot",
      description: "DESTRUCTIVE: Schedule a reboot for a NinjaOne-managed device. The device will restart immediately, interrupting active user sessions.",
      inputSchema: {
        type: "object" as const,
        properties: {
          device_id: {
            type: "number",
            description: "Integer NinjaOne device ID of the target device to reboot.",
          },
          reason: {
            type: "string",
            description: "Human-readable reason for the reboot; recorded in the activity log.",
          },
        },
        required: ["device_id"],
      },
    },
    {
      name: "ninjaone_devices_services",
      description: "List Windows services on a NinjaOne device by device_id (required); optionally filter by state (RUNNING/STOPPED/PAUSED). Use to audit running services or diagnose service issues.",
      inputSchema: {
        type: "object" as const,
        properties: {
          device_id: {
            type: "number",
            description: "Integer NinjaOne device ID.",
          },
          state: {
            type: "string",
            enum: ["RUNNING", "STOPPED", "PAUSED"],
            description: "Filter by service state; omit to return services in all states.",
          },
        },
        required: ["device_id"],
      },
    },
    {
      name: "ninjaone_devices_alerts",
      description: "Get active alerts for a NinjaOne device by device_id (required); optionally filter by severity (CRITICAL/MAJOR/MINOR/NONE). Use to check current device health.",
      inputSchema: {
        type: "object" as const,
        properties: {
          device_id: {
            type: "number",
            description: "Integer NinjaOne device ID.",
          },
          severity: {
            type: "string",
            enum: ["CRITICAL", "MAJOR", "MINOR", "NONE"],
            description: "Filter alerts to only the specified severity level.",
          },
        },
        required: ["device_id"],
      },
    },
    {
      name: "ninjaone_devices_activities",
      description: "Get the activity log for a NinjaOne device by device_id (required); optionally filter by activity_type (e.g. 'REBOOT'). Returns a timeline of events on the device.",
      inputSchema: {
        type: "object" as const,
        properties: {
          device_id: {
            type: "number",
            description: "Integer NinjaOne device ID.",
          },
          activity_type: {
            type: "string",
            description: "Filter by activity type string (e.g. 'REBOOT', 'POLICY_CHANGE').",
          },
          limit: {
            type: "number",
            description: "Page size — maximum activity records to return (default: 50).",
          },
        },
        required: ["device_id"],
      },
    },
  ];
}

/**
 * Handle a device domain tool call
 */
async function handleCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<CallToolResult> {
  const client = await getClient();

  switch (toolName) {
    case "ninjaone_devices_list": {
      const limit = (args.limit as number) || 50;
      const cursor = args.cursor as string | undefined;
      let organizationId = args.organization_id as number | undefined;

      // If no organization filter provided, elicit organization selection
      const hasOrgFilter = args.organization_id !== undefined;

      if (!hasOrgFilter) {
        try {
          // Fetch organizations to present as options
          const orgs = await client.organizations.list();
          if (orgs.length > 0) {
            const options = orgs.slice(0, 20).map((org) => ({
              value: String(org.id),
              label: org.name || `Organization ${org.id}`,
            }));
            options.push({ value: "all", label: "All organizations (no filter)" });

            const selection = await elicitSelection(
              "No organization filter provided. Would you like to filter devices by organization?",
              "organization",
              options
            );

            if (selection && selection !== "all") {
              organizationId = parseInt(selection, 10);
            }
          }
        } catch {
          // If org fetch fails, proceed without filter
        }
      }

      logger.info("API call: devices.list", {
        organizationId,
        deviceClass: args.device_class,
        online: args.online,
        limit,
        cursor,
      });

      const devices = await client.devices.list({
        organizationId,
        pageSize: limit,
        cursor,
      });
      logger.debug("API response: devices.list", { deviceCount: devices.length });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ devices }, null, 2),
          },
        ],
      };
    }

    case "ninjaone_devices_get": {
      const deviceId = (args.device_id ?? args.deviceId ?? args.id) as number;
      if (!deviceId) {
        return {
          content: [{ type: "text", text: "Error: device_id is required" }],
          isError: true,
        };
      }
      logger.info("API call: devices.get", { deviceId });
      const device = await client.devices.get(deviceId);
      logger.debug("API response: devices.get", { device });

      return {
        content: [{ type: "text", text: JSON.stringify(device, null, 2) }],
      };
    }

    case "ninjaone_devices_reboot": {
      const deviceId = args.device_id as number;
      const reason = args.reason as string | undefined;
      logger.info("API call: devices.reboot", { deviceId, reason });
      const result = await client.devices.reboot(deviceId, reason);
      logger.debug("API response: devices.reboot", { result });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { success: true, message: "Reboot scheduled", result },
              null,
              2
            ),
          },
        ],
      };
    }

    case "ninjaone_devices_services": {
      const deviceId = args.device_id as number;
      const stateFilter = args.state as string | undefined;
      logger.info("API call: devices.getServices", { deviceId, state: stateFilter });
      let services = await client.devices.getServices(deviceId);
      if (stateFilter) {
        services = services.filter((s) => s.state === stateFilter);
      }
      logger.debug("API response: devices.getServices", { services });

      return {
        content: [{ type: "text", text: JSON.stringify(services, null, 2) }],
      };
    }

    case "ninjaone_devices_alerts": {
      const deviceId = args.device_id as number;
      const severityFilter = args.severity as string | undefined;
      logger.info("API call: alerts.listByDevice", { deviceId, severity: severityFilter });
      let alerts = await client.alerts.listByDevice(deviceId);
      if (severityFilter) {
        alerts = alerts.filter((a) => a.severity === severityFilter);
      }
      logger.debug("API response: alerts.listByDevice", { alerts });

      return {
        content: [{ type: "text", text: JSON.stringify(alerts, null, 2) }],
      };
    }

    case "ninjaone_devices_activities": {
      const deviceId = args.device_id as number;
      const limit = (args.limit as number) || 50;
      logger.info("API call: devices.getActivities", { deviceId, limit });
      const activities = await client.devices.getActivities(deviceId, {
        pageSize: limit,
      });
      logger.debug("API response: devices.getActivities", { activities });

      return {
        content: [{ type: "text", text: JSON.stringify(activities, null, 2) }],
      };
    }

    default:
      return {
        content: [{ type: "text", text: `Unknown device tool: ${toolName}` }],
        isError: true,
      };
  }
}

export const devicesHandler: DomainHandler = {
  getTools,
  handleCall,
};
