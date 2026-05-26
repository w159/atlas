# Blumira MCP Server

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that provides AI assistants with structured access to [Blumira](https://blumira.com) SIEM platform data and operations.

## Quick Start

**Claude Desktop** — download, open, done:

1. Download `blumira-mcp.mcpb` from the [latest release](https://github.com/w159/blumira-mcp/releases/latest)
2. Open the file (double-click or drag into Claude Desktop)
3. Enter your Blumira JWT token when prompted

No terminal, no JSON editing, no Node.js install required.

**Claude Code (CLI):**

```bash
claude mcp add blumira-mcp \
  -e BLUMIRA_JWT_TOKEN=your-jwt-token \
  -- npx -y github:w159/blumira-mcp
```

See [Installation](#installation) for Docker and from-source methods.

## Features

- **🔌 MCP Protocol Compliance**: Full support for MCP resources and tools
- **🛡️ Comprehensive SIEM Coverage**: Tools spanning findings, agents/devices, users, resolutions, and MSP account management
- **🔍 Decision-Tree Navigation**: Start with `blumira_navigate` to explore domains, then dynamically load domain-specific tools
- **🏢 MSP Multi-Tenant Support**: Full MSP endpoint coverage for managing findings, agents, and users across accounts
- **🔒 Secure Authentication**: JWT token or API key (`pax8ApiTokenV1`) authentication
- **🌐 Dual Transport**: Supports both stdio (local) and HTTP Streamable (remote/Docker) transports
- **📦 MCPB Packaging**: One-click installation via MCP Bundle for desktop clients
- **🐳 Docker Ready**: Containerized deployment with HTTP transport and health checks
- **⚡ Rate Limiting**: Built-in rate limiter respects Blumira API limits
- **🔎 Rich Filtering**: Support for `.eq`, `.in`, `.gt`, `.lt`, `.contains`, `.regex`, and negation operators

## Installation

### Option 1: MCPB Bundle (Claude Desktop)

The simplest method — no terminal, no JSON editing, no Node.js install required.

1. Download `blumira-mcp.mcpb` from the [latest release](https://github.com/w159/blumira-mcp/releases/latest)
2. Open the file (double-click or drag into Claude Desktop)
3. Enter your Blumira JWT token when prompted

For **Claude Code (CLI)**, one command:

```bash
claude mcp add blumira-mcp \
  -e BLUMIRA_JWT_TOKEN=your-jwt-token \
  -- npx -y github:w159/blumira-mcp
```

### Option 2: Docker

```bash
docker compose up
```

Or pull the pre-built image:

```bash
docker run -d \
  -e BLUMIRA_JWT_TOKEN=your-token \
  -p 8080:8080 \
  ghcr.io/w159/blumira-mcp:latest
```

### Option 3: From Source

```bash
git clone https://github.com/w159/blumira-mcp.git
cd blumira-mcp
npm ci
npm run build
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `BLUMIRA_JWT_TOKEN` | JWT token for authentication | — |
| `MCP_TRANSPORT` | Transport mode (`stdio` or `http`) | `stdio` |
| `MCP_HTTP_PORT` | HTTP server port | `8080` |
| `AUTH_MODE` | Auth mode (`env` or `gateway`) | `env` |
| `LOG_LEVEL` | Log level (`debug`, `info`, `warn`, `error`) | `info` |

## Domains

The server uses decision-tree navigation. Start with `blumira_navigate` to pick a domain:

| Domain | Tools |
|--------|-------|
| **findings** | List findings, get finding, get finding details, resolve finding, assign owners, list/add comments |
| **agents** | List devices, get device, list agent keys, get agent key |
| **users** | List users |
| **resolutions** | List available resolutions |
| **msp** | List/get accounts, list/get/resolve findings, assign owners, comments, list devices/keys, list users |

## Filtering

Blumira supports rich query filtering on list endpoints:

```
status.eq=10              # Exact match
severity.in=HIGH,CRITICAL # Multiple values
created_at.gt=2026-01-01  # Greater than
name.contains=malware     # Substring match
!status.eq=30             # Negation
```

Pass filters as tool input parameters — the server handles query string construction.

## Docker Deployment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
# Edit .env with your Blumira JWT token
docker compose up -d
```

## Development

```bash
npm ci
npm run build       # Build the project
npm run dev         # Watch mode
npm run test        # Run tests
npm run lint        # Type-check
npm run clean       # Remove dist/
```

## License

Apache 2.0
