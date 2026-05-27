import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CwManageClient } from "../api-client.js";

export function registerServiceTools(server: McpServer, client: CwManageClient) {
  server.tool(
    "cw_list_boards",
    "List service boards in ConnectWise Manage. Returns board IDs and names needed for cw_list_statuses and cw_create_ticket. Use to discover available service queues.",
    {
      conditions: z.string().optional().describe("ConnectWise conditions query string (e.g. \"name like '%Service%'\")"),
      page: z.number().optional().describe("Page number (default: 1)"),
      pageSize: z.number().optional().describe("Results per page (default: 25, max: 1000)"),
    },
    async ({ conditions, page, pageSize }) => {
      try {
        const result = await client.get("/service/boards", {
          conditions,
          page: page ?? 1,
          pageSize: pageSize ?? 25,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `ConnectWise error: ${msg}. Verify CW_MANAGE_* credentials.` }], isError: true };
      }
    },
  );

  server.tool(
    "cw_list_priorities",
    "List ticket priority levels in ConnectWise Manage. Returns priority IDs and names needed for cw_create_ticket and cw_update_ticket. Use to discover valid priority values.",
    {
      conditions: z.string().optional().describe("ConnectWise conditions query string"),
      page: z.number().optional().describe("Page number (default: 1)"),
      pageSize: z.number().optional().describe("Results per page (default: 25, max: 1000)"),
    },
    async ({ conditions, page, pageSize }) => {
      try {
        const result = await client.get("/service/priorities", {
          conditions,
          page: page ?? 1,
          pageSize: pageSize ?? 25,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `ConnectWise error: ${msg}. Verify CW_MANAGE_* credentials.` }], isError: true };
      }
    },
  );

  server.tool(
    "cw_list_statuses",
    "List ticket statuses for a specific ConnectWise Manage service board (boardId required). Returns status IDs and names needed for cw_create_ticket and cw_update_ticket.",
    {
      boardId: z.number().describe("Integer service board ID (from cw_list_boards)"),
      conditions: z.string().optional().describe("ConnectWise conditions query string"),
      page: z.number().optional().describe("Page number (default: 1)"),
      pageSize: z.number().optional().describe("Results per page (default: 25, max: 1000)"),
    },
    async ({ boardId, conditions, page, pageSize }) => {
      try {
        const result = await client.get(`/service/boards/${boardId}/statuses`, {
          conditions,
          page: page ?? 1,
          pageSize: pageSize ?? 25,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: [{ type: "text", text: `ConnectWise error: ${msg}. Verify boardId from cw_list_boards and CW_MANAGE_* credentials.` }], isError: true };
      }
    },
  );
}
