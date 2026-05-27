/**
 * Alerts domain handler
 *
 * Provides tools for alert operations in NinjaOne.
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { DomainHandler, CallToolResult } from "../utils/types.js";
import type { AlertSeverity, AlertSourceType } from "node-ninjaone";
import { getClient } from "../utils/client.js";
import { logger } from "../utils/logger.js";
import { elicitSelection } from "../utils/elicitation.js";

/**
 * Get alert domain tools
 */
function getTools(): Tool[] {
  return [
    {
      name: "ninjaone_alerts_list",
      description:
        "List active NinjaOne alerts; filter by severity (CRITICAL/MAJOR/MINOR/NONE), organization_id, or device_id. Returns alert IDs needed for reset/resolve operations.",
      inputSchema: {
        type: "object" as const,
        properties: {
          severity: {
            type: "string",
            enum: ["CRITICAL", "MAJOR", "MINOR", "NONE"],
            description: "Filter alerts to only the specified severity level.",
          },
          organization_id: {
            type: "number",
            description: "Integer NinjaOne organization ID; restricts results to one customer account.",
          },
          device_id: {
            type: "number",
            description: "Integer NinjaOne device ID; restricts results to alerts from one device.",
          },
          source_type: {
            type: "string",
            description: "Filter by alert source type (e.g. CONDITION, ACTIVITY).",
          },
          limit: {
            type: "number",
            description: "Page size — maximum alerts to return in one call (default: 50).",
          },
          cursor: {
            type: "string",
            description: "Opaque pagination cursor from the previous page response.",
          },
        },
      },
    },
    {
      name: "ninjaone_alerts_reset",
      description:
        "VISIBLE-TO-OTHERS: Reset (dismiss) an alert — acknowledges and marks as handled. The alert is removed from active alert views for all users.",
      inputSchema: {
        type: "object" as const,
        properties: {
          alert_uid: {
            type: "string",
            description: "UUID string identifying the specific alert to dismiss.",
          },
        },
        required: ["alert_uid"],
      },
    },
    {
      name: "ninjaone_alerts_reset_all",
      description:
        "DESTRUCTIVE: Bulk-dismiss all alerts for a device or organization — removes all matching alerts from the active queue for all users. Requires device_id or organization_id.",
      inputSchema: {
        type: "object" as const,
        properties: {
          device_id: {
            type: "number",
            description: "Integer NinjaOne device ID; dismisses all alerts for this device.",
          },
          organization_id: {
            type: "number",
            description: "Integer NinjaOne organization ID; dismisses all alerts for this organization.",
          },
          severity: {
            type: "string",
            enum: ["CRITICAL", "MAJOR", "MINOR", "NONE"],
            description: "Optionally restrict bulk-dismiss to only this severity level.",
          },
        },
      },
    },
    {
      name: "ninjaone_alerts_summary",
      description:
        "Get alert count summary grouped by severity and/or organization",
      inputSchema: {
        type: "object" as const,
        properties: {
          group_by: {
            type: "string",
            enum: ["severity", "organization", "both"],
            description: "Dimension to group counts by: 'severity', 'organization', or 'both' (default: 'severity').",
          },
        },
      },
    },
  ];
}

/**
 * Handle an alert domain tool call
 */
async function handleCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<CallToolResult> {
  const client = await getClient();

  switch (toolName) {
    case "ninjaone_alerts_list": {
      const limit = (args.limit as number) || 50;
      const cursor = args.cursor as string | undefined;
      let severity = args.severity as AlertSeverity | undefined;

      // If no filters provided, elicit a severity filter
      const hasFilters =
        args.severity || args.organization_id || args.device_id || args.source_type;

      if (!hasFilters) {
        const selection = await elicitSelection(
          "No filters provided. Would you like to filter alerts by severity?",
          "severity",
          [
            { value: "CRITICAL", label: "Critical" },
            { value: "MAJOR", label: "Major" },
            { value: "MINOR", label: "Minor" },
            { value: "all", label: "All severities (no filter)" },
          ]
        );

        if (selection && selection !== "all") {
          severity = selection as AlertSeverity;
        }
      }

      logger.info("API call: alerts.list", {
        severity,
        organizationId: args.organization_id,
        deviceId: args.device_id,
        sourceType: args.source_type,
        limit,
        cursor,
      });

      const alerts = await client.alerts.list({
        severity,
        organizationId: args.organization_id as number | undefined,
        deviceId: args.device_id as number | undefined,
        sourceType: args.source_type as AlertSourceType | undefined,
        pageSize: limit,
        cursor,
      });
      logger.debug("API response: alerts.list", { count: alerts.length });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ alerts }, null, 2),
          },
        ],
      };
    }

    case "ninjaone_alerts_reset": {
      const alertUid = args.alert_uid as string;
      logger.info("API call: alerts.reset", { alertUid });
      const result = await client.alerts.reset(alertUid);
      logger.debug("API response: alerts.reset", { result });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { success: true, message: "Alert reset successfully", result },
              null,
              2
            ),
          },
        ],
      };
    }

    case "ninjaone_alerts_reset_all": {
      const deviceId = args.device_id as number | undefined;
      const organizationId = args.organization_id as number | undefined;
      const severity = args.severity as string | undefined;

      if (!deviceId && !organizationId) {
        return {
          content: [
            {
              type: "text",
              text: "Error: Must specify either device_id or organization_id to reset alerts",
            },
          ],
          isError: true,
        };
      }

      logger.info("API call: alerts.resetAll", { deviceId, organizationId, severity });
      let result;
      if (deviceId) {
        result = await client.alerts.resetByDevice(deviceId);
      } else if (organizationId) {
        result = await client.alerts.resetByOrganization(organizationId);
      }
      logger.debug("API response: alerts.resetAll", { result });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { success: true, message: "Alerts reset successfully", result },
              null,
              2
            ),
          },
        ],
      };
    }

    case "ninjaone_alerts_summary": {
      const groupBy = (args.group_by as string) || "severity";
      logger.info("API call: alerts.list (for summary)", { groupBy });
      const alerts = await client.alerts.list();

      const summary: Record<string, Record<string, number>> = {};
      for (const alert of alerts) {
        if (groupBy === "severity" || groupBy === "both") {
          const sev = alert.severity || "UNKNOWN";
          summary.bySeverity = summary.bySeverity || {};
          summary.bySeverity[sev] = (summary.bySeverity[sev] || 0) + 1;
        }
        if (groupBy === "organization" || groupBy === "both") {
          const orgId = String(alert.organizationId || "UNKNOWN");
          summary.byOrganization = summary.byOrganization || {};
          summary.byOrganization[orgId] = (summary.byOrganization[orgId] || 0) + 1;
        }
      }
      logger.debug("API response: alerts summary", { summary });

      return {
        content: [{ type: "text", text: JSON.stringify({ total: alerts.length, ...summary }, null, 2) }],
      };
    }

    default:
      return {
        content: [{ type: "text", text: `Unknown alert tool: ${toolName}` }],
        isError: true,
      };
  }
}

export const alertsHandler: DomainHandler = {
  getTools,
  handleCall,
};
