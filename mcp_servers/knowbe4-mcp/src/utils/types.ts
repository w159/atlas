/**
 * Shared types for the KnowBe4 MCP server
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * Tool call result type - inline definition for MCP SDK compatibility
 */
export type CallToolResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

/**
 * Domain handler interface
 */
export interface DomainHandler {
  /** Get the tools for this domain */
  getTools(): Tool[];
  /** Handle a tool call */
  handleCall(
    toolName: string,
    args: Record<string, unknown>
  ): Promise<CallToolResult>;
}

/**
 * Domain names for KnowBe4
 */
export type DomainName =
  | "account"
  | "users"
  | "groups"
  | "phishing"
  | "training"
  | "reporting";

/**
 * Check if a string is a valid domain name
 */
export function isDomainName(value: string): value is DomainName {
  return ["account", "users", "groups", "phishing", "training", "reporting"].includes(value);
}

/**
 * KnowBe4 credentials extracted from environment or gateway headers
 */
export interface KnowBe4Credentials {
  apiKey: string;
  baseUrl: string;
}

/**
 * KnowBe4 API regions and their base URLs
 */
export const KNOWBE4_REGIONS: Record<string, string> = {
  us: "https://us.api.knowbe4.com",
  eu: "https://eu.api.knowbe4.com",
  ca: "https://ca.api.knowbe4.com",
  uk: "https://uk.api.knowbe4.com",
  de: "https://de.api.knowbe4.com",
};
