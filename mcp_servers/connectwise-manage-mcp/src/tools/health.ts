import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CwManageClient, getConfig } from "../api-client.js";

export function registerHealthTools(server: McpServer, client: CwManageClient) {
  server.tool(
    "cw_status",
    "Show ConnectWise Manage MCP server configuration status: which environment variables are set and what base URL is in use. Always works, even with missing credentials.",
    {},
    async () => {
      const config = getConfig();
      const status = {
        configured: !!config,
        baseUrl: config?.baseUrl ?? process.env.CW_MANAGE_URL ?? process.env.CW_MANAGE_BASE_URL ?? "https://api-na.myconnectwise.net (default)",
        credentials: {
          CW_MANAGE_COMPANY_ID: process.env.CW_MANAGE_COMPANY_ID ? "set" : "NOT SET — required",
          CW_MANAGE_PUBLIC_KEY: process.env.CW_MANAGE_PUBLIC_KEY ? "set" : "NOT SET — required",
          CW_MANAGE_PRIVATE_KEY: process.env.CW_MANAGE_PRIVATE_KEY ? "set" : "NOT SET — required",
          CW_MANAGE_CLIENT_ID: process.env.CW_MANAGE_CLIENT_ID ? "set" : "NOT SET — required",
          CW_MANAGE_URL: process.env.CW_MANAGE_URL ?? process.env.CW_MANAGE_BASE_URL ?? "(not set — using default)",
        },
      };
      return { content: [{ type: "text", text: JSON.stringify(status, null, 2) }] };
    },
  );

  server.tool(
    "cw_test_connection",
    "Verify ConnectWise Manage API connectivity by fetching system info. Returns API version and licensing details. Use to confirm credentials are working.",
    {},
    async () => {
      try {
        const result = await client.get("/system/info");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const hint = msg.includes("401") || msg.includes("403")
          ? "Verify CW_MANAGE_COMPANY_ID, CW_MANAGE_PUBLIC_KEY, CW_MANAGE_PRIVATE_KEY, and CW_MANAGE_CLIENT_ID are correct."
          : msg.includes("ECONNREFUSED") || msg.includes("ENOTFOUND")
          ? "Cannot reach CW_MANAGE_URL. Verify the URL is correct and the host is reachable."
          : "Check ConnectWise Manage credentials and URL.";
        return {
          content: [{ type: "text", text: `ConnectWise Manage connection error: ${msg}. ${hint}` }],
          isError: true,
        };
      }
    },
  );
}
