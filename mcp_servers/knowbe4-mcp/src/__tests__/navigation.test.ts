/**
 * Tests for navigation and domain state management
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Create mock handlers using vi.hoisted
const { mockHandlers } = vi.hoisted(() => {
  const mockHandlers = {
    account: {
      getTools: vi.fn().mockReturnValue([
        { name: "knowbe4_account_get", description: "Get account info" },
        { name: "knowbe4_account_risk_score_history", description: "Get risk score history" },
      ]),
      handleCall: vi.fn(),
    },
    users: {
      getTools: vi.fn().mockReturnValue([
        { name: "knowbe4_users_list", description: "List users" },
        { name: "knowbe4_users_get", description: "Get user" },
        { name: "knowbe4_users_risk_score_history", description: "Get user risk score history" },
      ]),
      handleCall: vi.fn(),
    },
    groups: {
      getTools: vi.fn().mockReturnValue([
        { name: "knowbe4_groups_list", description: "List groups" },
        { name: "knowbe4_groups_get", description: "Get group" },
        { name: "knowbe4_groups_members", description: "Get group members" },
        { name: "knowbe4_groups_risk_score_history", description: "Get group risk score history" },
      ]),
      handleCall: vi.fn(),
    },
    phishing: {
      getTools: vi.fn().mockReturnValue([
        { name: "knowbe4_phishing_campaigns_list", description: "List phishing campaigns" },
        { name: "knowbe4_phishing_campaigns_get", description: "Get phishing campaign" },
        { name: "knowbe4_phishing_security_tests_list", description: "List PSTs" },
      ]),
      handleCall: vi.fn(),
    },
    training: {
      getTools: vi.fn().mockReturnValue([
        { name: "knowbe4_training_campaigns_list", description: "List training campaigns" },
        { name: "knowbe4_training_campaigns_get", description: "Get training campaign" },
        { name: "knowbe4_training_enrollments_list", description: "List enrollments" },
      ]),
      handleCall: vi.fn(),
    },
    reporting: {
      getTools: vi.fn().mockReturnValue([
        { name: "knowbe4_reporting_phishing_summary", description: "Phishing summary" },
        { name: "knowbe4_reporting_training_summary", description: "Training summary" },
        { name: "knowbe4_reporting_risk_overview", description: "Risk overview" },
      ]),
      handleCall: vi.fn(),
    },
  };

  return { mockHandlers };
});

// Mock all domain handlers
vi.mock("../domains/account.js", () => ({
  accountHandler: mockHandlers.account,
}));

vi.mock("../domains/users.js", () => ({
  usersHandler: mockHandlers.users,
}));

vi.mock("../domains/groups.js", () => ({
  groupsHandler: mockHandlers.groups,
}));

vi.mock("../domains/phishing.js", () => ({
  phishingHandler: mockHandlers.phishing,
}));

vi.mock("../domains/training.js", () => ({
  trainingHandler: mockHandlers.training,
}));

vi.mock("../domains/reporting.js", () => ({
  reportingHandler: mockHandlers.reporting,
}));

import {
  getDomainHandler,
  getAvailableDomains,
  clearDomainCache,
} from "../domains/index.js";
import { isDomainName } from "../utils/types.js";

describe("Domain Navigation", () => {
  beforeEach(() => {
    clearDomainCache();
    vi.clearAllMocks();

    // Re-set mock return values after clearAllMocks
    mockHandlers.account.getTools.mockReturnValue([
      { name: "knowbe4_account_get", description: "Get account info" },
      { name: "knowbe4_account_risk_score_history", description: "Get risk score history" },
    ]);
    mockHandlers.users.getTools.mockReturnValue([
      { name: "knowbe4_users_list", description: "List users" },
      { name: "knowbe4_users_get", description: "Get user" },
      { name: "knowbe4_users_risk_score_history", description: "Get user risk score history" },
    ]);
    mockHandlers.groups.getTools.mockReturnValue([
      { name: "knowbe4_groups_list", description: "List groups" },
      { name: "knowbe4_groups_get", description: "Get group" },
      { name: "knowbe4_groups_members", description: "Get group members" },
      { name: "knowbe4_groups_risk_score_history", description: "Get group risk score history" },
    ]);
    mockHandlers.phishing.getTools.mockReturnValue([
      { name: "knowbe4_phishing_campaigns_list", description: "List phishing campaigns" },
      { name: "knowbe4_phishing_campaigns_get", description: "Get phishing campaign" },
      { name: "knowbe4_phishing_security_tests_list", description: "List PSTs" },
    ]);
    mockHandlers.training.getTools.mockReturnValue([
      { name: "knowbe4_training_campaigns_list", description: "List training campaigns" },
      { name: "knowbe4_training_campaigns_get", description: "Get training campaign" },
      { name: "knowbe4_training_enrollments_list", description: "List enrollments" },
    ]);
    mockHandlers.reporting.getTools.mockReturnValue([
      { name: "knowbe4_reporting_phishing_summary", description: "Phishing summary" },
      { name: "knowbe4_reporting_training_summary", description: "Training summary" },
      { name: "knowbe4_reporting_risk_overview", description: "Risk overview" },
    ]);
  });

  describe("getAvailableDomains", () => {
    it("should return all available domains", () => {
      const domains = getAvailableDomains();
      expect(domains).toEqual(["account", "users", "groups", "phishing", "training", "reporting"]);
    });

    it("should return a consistent list", () => {
      const domains1 = getAvailableDomains();
      const domains2 = getAvailableDomains();
      expect(domains1).toEqual(domains2);
    });
  });

  describe("isDomainName", () => {
    it("should return true for valid domain names", () => {
      expect(isDomainName("account")).toBe(true);
      expect(isDomainName("users")).toBe(true);
      expect(isDomainName("groups")).toBe(true);
      expect(isDomainName("phishing")).toBe(true);
      expect(isDomainName("training")).toBe(true);
      expect(isDomainName("reporting")).toBe(true);
    });

    it("should return false for invalid domain names", () => {
      expect(isDomainName("invalid")).toBe(false);
      expect(isDomainName("")).toBe(false);
      expect(isDomainName("ACCOUNT")).toBe(false);
      expect(isDomainName("devices")).toBe(false);
    });
  });

  describe("getDomainHandler", () => {
    it("should load account domain handler", async () => {
      const handler = await getDomainHandler("account");
      expect(handler).toBeDefined();
      expect(handler.getTools).toBeDefined();
      expect(handler.handleCall).toBeDefined();
    });

    it("should load users domain handler", async () => {
      const handler = await getDomainHandler("users");
      expect(handler).toBeDefined();
      expect(handler.getTools()).toHaveLength(3);
    });

    it("should load groups domain handler", async () => {
      const handler = await getDomainHandler("groups");
      expect(handler).toBeDefined();
      expect(handler.getTools()).toHaveLength(4);
    });

    it("should load phishing domain handler", async () => {
      const handler = await getDomainHandler("phishing");
      expect(handler).toBeDefined();
      expect(handler.getTools()).toHaveLength(3);
    });

    it("should load training domain handler", async () => {
      const handler = await getDomainHandler("training");
      expect(handler).toBeDefined();
      expect(handler.getTools()).toHaveLength(3);
    });

    it("should load reporting domain handler", async () => {
      const handler = await getDomainHandler("reporting");
      expect(handler).toBeDefined();
      expect(handler.getTools()).toHaveLength(3);
    });

    it("should cache domain handlers", async () => {
      const handler1 = await getDomainHandler("account");
      const handler2 = await getDomainHandler("account");
      expect(handler1).toBe(handler2);
    });

    it("should throw for unknown domain", async () => {
      await expect(
        getDomainHandler("unknown" as "account")
      ).rejects.toThrow("Unknown domain: unknown");
    });
  });

  describe("clearDomainCache", () => {
    it("should clear the cached handlers", async () => {
      await getDomainHandler("account");
      clearDomainCache();
      const handler2 = await getDomainHandler("account");
      expect(handler2).toBeDefined();
      expect(handler2.getTools).toBeDefined();
    });
  });
});

describe("Domain Tools Structure", () => {
  beforeEach(() => {
    clearDomainCache();
    vi.clearAllMocks();

    mockHandlers.account.getTools.mockReturnValue([
      { name: "knowbe4_account_get", description: "Get account info" },
      { name: "knowbe4_account_risk_score_history", description: "Get risk score history" },
    ]);
    mockHandlers.users.getTools.mockReturnValue([
      { name: "knowbe4_users_list", description: "List users" },
      { name: "knowbe4_users_get", description: "Get user" },
      { name: "knowbe4_users_risk_score_history", description: "Get user risk score history" },
    ]);
    mockHandlers.groups.getTools.mockReturnValue([
      { name: "knowbe4_groups_list", description: "List groups" },
      { name: "knowbe4_groups_get", description: "Get group" },
      { name: "knowbe4_groups_members", description: "Get group members" },
      { name: "knowbe4_groups_risk_score_history", description: "Get group risk score history" },
    ]);
    mockHandlers.phishing.getTools.mockReturnValue([
      { name: "knowbe4_phishing_campaigns_list", description: "List phishing campaigns" },
      { name: "knowbe4_phishing_campaigns_get", description: "Get phishing campaign" },
      { name: "knowbe4_phishing_security_tests_list", description: "List PSTs" },
    ]);
    mockHandlers.training.getTools.mockReturnValue([
      { name: "knowbe4_training_campaigns_list", description: "List training campaigns" },
      { name: "knowbe4_training_campaigns_get", description: "Get training campaign" },
      { name: "knowbe4_training_enrollments_list", description: "List enrollments" },
    ]);
    mockHandlers.reporting.getTools.mockReturnValue([
      { name: "knowbe4_reporting_phishing_summary", description: "Phishing summary" },
      { name: "knowbe4_reporting_training_summary", description: "Training summary" },
      { name: "knowbe4_reporting_risk_overview", description: "Risk overview" },
    ]);
  });

  it("account domain should expose account-specific tools", async () => {
    const handler = await getDomainHandler("account");
    const tools = handler.getTools();
    const toolNames = tools.map((t) => t.name);
    expect(toolNames).toContain("knowbe4_account_get");
    expect(toolNames).toContain("knowbe4_account_risk_score_history");
  });

  it("users domain should expose user management tools", async () => {
    const handler = await getDomainHandler("users");
    const tools = handler.getTools();
    const toolNames = tools.map((t) => t.name);
    expect(toolNames).toContain("knowbe4_users_list");
    expect(toolNames).toContain("knowbe4_users_get");
    expect(toolNames).toContain("knowbe4_users_risk_score_history");
  });

  it("phishing domain should expose phishing tools", async () => {
    const handler = await getDomainHandler("phishing");
    const tools = handler.getTools();
    const toolNames = tools.map((t) => t.name);
    expect(toolNames).toContain("knowbe4_phishing_campaigns_list");
  });

  it("training domain should expose training tools", async () => {
    const handler = await getDomainHandler("training");
    const tools = handler.getTools();
    const toolNames = tools.map((t) => t.name);
    expect(toolNames).toContain("knowbe4_training_campaigns_list");
  });

  it("reporting domain should expose reporting tools", async () => {
    const handler = await getDomainHandler("reporting");
    const tools = handler.getTools();
    const toolNames = tools.map((t) => t.name);
    expect(toolNames).toContain("knowbe4_reporting_phishing_summary");
    expect(toolNames).toContain("knowbe4_reporting_risk_overview");
  });
});
