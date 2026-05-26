# Copilot Code Review Instructions — Blumira MCP Server

## Review Philosophy
- Only comment when you have HIGH CONFIDENCE (>80%) that an issue exists
- Be concise: one sentence per comment when possible
- Focus on actionable feedback, not observations

## Project Context
- **Stack**: TypeScript (ESM), MCP SDK (`@modelcontextprotocol/sdk`), `node-blumira`
- **Transport**: Dual-mode — stdio (local/Claude Desktop) and Streamable HTTP (gateway)
- **Auth**: Bearer JWT token via `BLUMIRA_JWT_TOKEN` env var or gateway header
- **Tool pattern**: Decision-tree — navigation tool exposes domains first, then domain-specific tools
- **Packaging**: MCPB bundles (`.mcpb`) for Claude Desktop, Docker images for gateway
- **CI/CD**: GitHub Actions — test matrix, semantic-release, Docker build + MCPB upload
- **Testing**: Vitest

## Priority Areas

### Security
- JWT tokens must NEVER be logged
- Gateway header parsing must validate required fields
- No hardcoded credentials or URLs

### Correctness
- Tool handlers must return proper MCP error responses, never throw unhandled exceptions
- Navigation state changes must call `sendToolListChanged()`
- All logging goes to stderr (stdout = MCP protocol on stdio transport)
