/**
 * Tool categories for lazy-loading meta-tools mode.
 *
 * When LAZY_LOADING=true, the server exposes only four meta-tools instead of
 * the full decision-tree navigation. Clients discover available tools by
 * category, then load schemas on demand.
 */

import type { DomainName } from "./types.js";

export interface ToolCategory {
  description: string;
  tools: string[];
}

/**
 * Maps each domain to its human-readable description and the tool names it
 * provides.  Keep this in sync with the individual domain handlers in
 * src/domains/.
 */
export const TOOL_CATEGORIES: Record<DomainName, ToolCategory> = {
  account: {
    description: "Account info and risk scores",
    tools: [
      "knowbe4_account_get",
      "knowbe4_account_risk_score_history",
    ],
  },
  users: {
    description: "User management and risk history",
    tools: [
      "knowbe4_users_list",
      "knowbe4_users_get",
      "knowbe4_users_risk_score_history",
    ],
  },
  groups: {
    description: "Group management and members",
    tools: [
      "knowbe4_groups_list",
      "knowbe4_groups_get",
      "knowbe4_groups_members",
      "knowbe4_groups_risk_score_history",
    ],
  },
  phishing: {
    description: "Phishing campaigns and security tests",
    tools: [
      "knowbe4_phishing_campaigns_list",
      "knowbe4_phishing_campaigns_get",
      "knowbe4_phishing_security_tests_list",
      "knowbe4_phishing_campaign_tests",
      "knowbe4_phishing_security_test_get",
      "knowbe4_phishing_security_test_recipients",
      "knowbe4_phishing_security_test_recipient",
    ],
  },
  training: {
    description: "Training campaigns and enrollments",
    tools: [
      "knowbe4_training_campaigns_list",
      "knowbe4_training_campaigns_get",
      "knowbe4_training_enrollments_list",
      "knowbe4_training_enrollments_get",
      "knowbe4_store_purchases_list",
      "knowbe4_store_purchases_get",
      "knowbe4_policies_list",
      "knowbe4_policies_get",
    ],
  },
  reporting: {
    description: "Security reports and metrics",
    tools: [
      "knowbe4_reporting_phishing_summary",
      "knowbe4_reporting_training_summary",
      "knowbe4_reporting_risk_overview",
    ],
  },
};

/**
 * Reverse lookup: given a tool name, return the domain that owns it.
 */
export function findDomainForTool(toolName: string): DomainName | null {
  for (const [domain, category] of Object.entries(TOOL_CATEGORIES)) {
    if (category.tools.includes(toolName)) {
      return domain as DomainName;
    }
  }
  return null;
}

/**
 * Simple keyword-to-tool router. Maps common intent phrases to suggested
 * tools so the LLM can ask "what tool should I use for X?" without loading
 * every schema.
 */
const INTENT_KEYWORDS: Record<string, string[]> = {
  // Account
  account: ["knowbe4_account_get"],
  subscription: ["knowbe4_account_get"],
  "risk score history": ["knowbe4_account_risk_score_history", "knowbe4_users_risk_score_history", "knowbe4_groups_risk_score_history"],
  "risk score": ["knowbe4_reporting_risk_overview", "knowbe4_account_risk_score_history"],
  // Users
  user: ["knowbe4_users_list", "knowbe4_users_get"],
  users: ["knowbe4_users_list"],
  "user risk": ["knowbe4_users_risk_score_history"],
  // Groups
  group: ["knowbe4_groups_list", "knowbe4_groups_get"],
  groups: ["knowbe4_groups_list"],
  member: ["knowbe4_groups_members"],
  members: ["knowbe4_groups_members"],
  // Phishing
  phishing: ["knowbe4_phishing_campaigns_list", "knowbe4_phishing_security_tests_list"],
  phish: ["knowbe4_phishing_campaigns_list", "knowbe4_phishing_security_tests_list"],
  campaign: ["knowbe4_phishing_campaigns_list", "knowbe4_training_campaigns_list"],
  "security test": ["knowbe4_phishing_security_tests_list", "knowbe4_phishing_security_test_get"],
  recipient: ["knowbe4_phishing_security_test_recipients"],
  click: ["knowbe4_phishing_security_test_recipients", "knowbe4_reporting_phishing_summary"],
  // Training
  training: ["knowbe4_training_campaigns_list", "knowbe4_training_enrollments_list"],
  enrollment: ["knowbe4_training_enrollments_list", "knowbe4_training_enrollments_get"],
  policy: ["knowbe4_policies_list", "knowbe4_policies_get"],
  policies: ["knowbe4_policies_list"],
  store: ["knowbe4_store_purchases_list"],
  purchase: ["knowbe4_store_purchases_list", "knowbe4_store_purchases_get"],
  // Reporting
  report: ["knowbe4_reporting_phishing_summary", "knowbe4_reporting_training_summary", "knowbe4_reporting_risk_overview"],
  summary: ["knowbe4_reporting_phishing_summary", "knowbe4_reporting_training_summary"],
  overview: ["knowbe4_reporting_risk_overview"],
  metric: ["knowbe4_reporting_phishing_summary", "knowbe4_reporting_training_summary"],
};

/**
 * Given a free-text intent string, return the best-matching tool suggestions.
 */
export function routeIntent(intent: string): string[] {
  const lower = intent.toLowerCase();
  const matches = new Set<string>();

  for (const [keyword, tools] of Object.entries(INTENT_KEYWORDS)) {
    if (lower.includes(keyword)) {
      for (const tool of tools) {
        matches.add(tool);
      }
    }
  }

  return [...matches];
}
