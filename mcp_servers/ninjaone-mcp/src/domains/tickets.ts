/**
 * Tickets domain handler
 *
 * Provides tools for ticket operations in NinjaOne.
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { DomainHandler, CallToolResult } from "../utils/types.js";
import type { TicketStatus, TicketPriority, TicketType } from "node-ninjaone";
import { getClient } from "../utils/client.js";
import { logger } from "../utils/logger.js";

/**
 * Get ticket domain tools
 */
function getTools(): Tool[] {
  return [
    {
      name: "ninjaone_tickets_list",
      description:
        "List NinjaOne helpdesk tickets; filter by status (OPEN/IN_PROGRESS/WAITING/CLOSED), organization_id, device_id, or board_id. Returns ticket IDs for further operations.",
      inputSchema: {
        type: "object" as const,
        properties: {
          status: {
            type: "string",
            enum: ["OPEN", "IN_PROGRESS", "WAITING", "CLOSED"],
            description: "Filter by ticket status.",
          },
          organization_id: {
            type: "number",
            description: "Integer NinjaOne organization ID; restricts results to tickets for one customer.",
          },
          device_id: {
            type: "number",
            description: "Integer NinjaOne device ID; restricts results to tickets linked to one device.",
          },
          board_id: {
            type: "number",
            description: "Integer service board ID; restricts results to one ticket board.",
          },
          limit: {
            type: "number",
            description: "Page size — maximum tickets to return in one call (default: 50).",
          },
          cursor: {
            type: "string",
            description: "Opaque pagination cursor from the previous page response.",
          },
        },
      },
    },
    {
      name: "ninjaone_tickets_get",
      description: "Get full details of a NinjaOne ticket by ticket_id (required). Returns subject, status, assignee, device, comments, and time entries.",
      inputSchema: {
        type: "object" as const,
        properties: {
          ticket_id: {
            type: "number",
            description: "Integer NinjaOne ticket ID.",
          },
        },
        required: ["ticket_id"],
      },
    },
    {
      name: "ninjaone_tickets_create",
      description: "Create a new NinjaOne helpdesk ticket (subject required). Optionally specify description, organization_id, device_id, priority, and status.",
      inputSchema: {
        type: "object" as const,
        properties: {
          subject: {
            type: "string",
            description: "Ticket title or subject line.",
          },
          description: {
            type: "string",
            description: "Detailed description of the issue or request.",
          },
          organization_id: {
            type: "number",
            description: "Integer NinjaOne organization ID; associates the ticket with a customer account.",
          },
          device_id: {
            type: "number",
            description: "Integer NinjaOne device ID; links the ticket to a specific device.",
          },
          board_id: {
            type: "number",
            description: "Integer service board ID; routes the ticket to a specific board.",
          },
          priority: {
            type: "string",
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            description: "Ticket priority level.",
          },
          type: {
            type: "string",
            enum: ["PROBLEM", "QUESTION", "INCIDENT", "TASK"],
            description: "Ticket type classification.",
          },
        },
        required: ["subject", "organization_id"],
      },
    },
    {
      name: "ninjaone_tickets_update",
      description: "Update existing ticket",
      inputSchema: {
        type: "object" as const,
        properties: {
          ticket_id: {
            type: "number",
            description: "Integer NinjaOne ticket ID of the ticket to update.",
          },
          subject: {
            type: "string",
            description: "Updated ticket title or subject line.",
          },
          description: {
            type: "string",
            description: "Updated detailed description.",
          },
          status: {
            type: "string",
            enum: ["OPEN", "IN_PROGRESS", "WAITING", "CLOSED"],
            description: "New ticket status.",
          },
          priority: {
            type: "string",
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            description: "New ticket priority level.",
          },
          assignee_id: {
            type: "number",
            description: "Integer NinjaOne technician/user ID to assign the ticket to.",
          },
        },
        required: ["ticket_id"],
      },
    },
    {
      name: "ninjaone_tickets_add_comment",
      description: "VISIBLE-TO-OTHERS: Add a comment to a NinjaOne ticket. Public comments are visible to the customer in the portal.",
      inputSchema: {
        type: "object" as const,
        properties: {
          ticket_id: {
            type: "number",
            description: "Integer NinjaOne ticket ID.",
          },
          body: {
            type: "string",
            description: "Comment text content.",
          },
          public: {
            type: "boolean",
            description: "When true the comment is visible to the customer in the portal (default: true).",
          },
        },
        required: ["ticket_id", "body"],
      },
    },
    {
      name: "ninjaone_tickets_comments",
      description: "Get ticket comments and activity",
      inputSchema: {
        type: "object" as const,
        properties: {
          ticket_id: {
            type: "number",
            description: "Integer NinjaOne ticket ID.",
          },
        },
        required: ["ticket_id"],
      },
    },
  ];
}

/**
 * Handle a ticket domain tool call
 */
async function handleCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<CallToolResult> {
  const client = await getClient();

  switch (toolName) {
    case "ninjaone_tickets_list": {
      const limit = (args.limit as number) || 50;
      const cursor = args.cursor as string | undefined;
      logger.info("API call: tickets.list", {
        status: args.status,
        organizationId: args.organization_id,
        deviceId: args.device_id,
        boardId: args.board_id,
        limit,
        cursor,
      });

      const response = await client.tickets.list({
        status: args.status as TicketStatus | undefined,
        organizationId: args.organization_id as number | undefined,
        deviceId: args.device_id as number | undefined,
        boardId: args.board_id as number | undefined,
        pageSize: limit,
      });
      logger.debug("API response: tickets.list", { count: response.tickets?.length });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    }

    case "ninjaone_tickets_get": {
      const ticketId = args.ticket_id as number;
      logger.info("API call: tickets.get", { ticketId });
      const ticket = await client.tickets.get(ticketId);
      logger.debug("API response: tickets.get", { ticket });

      return {
        content: [{ type: "text", text: JSON.stringify(ticket, null, 2) }],
      };
    }

    case "ninjaone_tickets_create": {
      logger.info("API call: tickets.create", { subject: args.subject, organizationId: args.organization_id });
      const ticket = await client.tickets.create({
        subject: args.subject as string,
        description: args.description as string | undefined,
        organizationId: args.organization_id as number,
        deviceId: args.device_id as number | undefined,
        priority: args.priority as TicketPriority | undefined,
        type: args.type as TicketType | undefined,
      });
      logger.debug("API response: tickets.create", { ticket });

      return {
        content: [{ type: "text", text: JSON.stringify(ticket, null, 2) }],
      };
    }

    case "ninjaone_tickets_update": {
      const ticketId = args.ticket_id as number;
      logger.info("API call: tickets.update", { ticketId });
      const ticket = await client.tickets.update(ticketId, {
        subject: args.subject as string | undefined,
        description: args.description as string | undefined,
        status: args.status as TicketStatus | undefined,
        priority: args.priority as TicketPriority | undefined,
        assigneeUid: args.assignee_id ? String(args.assignee_id) : undefined,
      });
      logger.debug("API response: tickets.update", { ticket });

      return {
        content: [{ type: "text", text: JSON.stringify(ticket, null, 2) }],
      };
    }

    case "ninjaone_tickets_add_comment": {
      const ticketId = args.ticket_id as number;
      logger.info("API call: tickets.addComment", { ticketId });
      const comment = await client.tickets.addComment(ticketId, {
        body: args.body as string,
        internal: args.public === false,
      });
      logger.debug("API response: tickets.addComment", { comment });

      return {
        content: [{ type: "text", text: JSON.stringify(comment, null, 2) }],
      };
    }

    case "ninjaone_tickets_comments": {
      const ticketId = args.ticket_id as number;
      logger.info("API call: tickets.getComments", { ticketId });
      const comments = await client.tickets.getComments(ticketId);
      logger.debug("API response: tickets.getComments", { comments });

      return {
        content: [{ type: "text", text: JSON.stringify(comments, null, 2) }],
      };
    }

    default:
      return {
        content: [{ type: "text", text: `Unknown ticket tool: ${toolName}` }],
        isError: true,
      };
  }
}

export const ticketsHandler: DomainHandler = {
  getTools,
  handleCall,
};
