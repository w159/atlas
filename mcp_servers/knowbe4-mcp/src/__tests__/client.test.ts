/**
 * Tests for the KnowBe4 client utility
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getCredentials } from "../utils/client.js";

describe("getCredentials", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should return null when KNOWBE4_API_KEY is not set", () => {
    delete process.env.KNOWBE4_API_KEY;
    const creds = getCredentials();
    expect(creds).toBeNull();
  });

  it("should return credentials when KNOWBE4_API_KEY is set", () => {
    process.env.KNOWBE4_API_KEY = "test-api-key-123";
    const creds = getCredentials();
    expect(creds).not.toBeNull();
    expect(creds!.apiKey).toBe("test-api-key-123");
    expect(creds!.baseUrl).toBe("https://us.api.knowbe4.com");
  });

  it("should use US region by default", () => {
    process.env.KNOWBE4_API_KEY = "test-key";
    delete process.env.KNOWBE4_REGION;
    const creds = getCredentials();
    expect(creds!.baseUrl).toBe("https://us.api.knowbe4.com");
  });

  it("should use EU region when specified", () => {
    process.env.KNOWBE4_API_KEY = "test-key";
    process.env.KNOWBE4_REGION = "eu";
    const creds = getCredentials();
    expect(creds!.baseUrl).toBe("https://eu.api.knowbe4.com");
  });

  it("should use CA region when specified", () => {
    process.env.KNOWBE4_API_KEY = "test-key";
    process.env.KNOWBE4_REGION = "ca";
    const creds = getCredentials();
    expect(creds!.baseUrl).toBe("https://ca.api.knowbe4.com");
  });

  it("should use UK region when specified", () => {
    process.env.KNOWBE4_API_KEY = "test-key";
    process.env.KNOWBE4_REGION = "uk";
    const creds = getCredentials();
    expect(creds!.baseUrl).toBe("https://uk.api.knowbe4.com");
  });

  it("should use DE region when specified", () => {
    process.env.KNOWBE4_API_KEY = "test-key";
    process.env.KNOWBE4_REGION = "de";
    const creds = getCredentials();
    expect(creds!.baseUrl).toBe("https://de.api.knowbe4.com");
  });

  it("should fall back to US for unknown region", () => {
    process.env.KNOWBE4_API_KEY = "test-key";
    process.env.KNOWBE4_REGION = "unknown";
    const creds = getCredentials();
    expect(creds!.baseUrl).toBe("https://us.api.knowbe4.com");
  });

  it("should allow custom base URL override", () => {
    process.env.KNOWBE4_API_KEY = "test-key";
    process.env.KNOWBE4_BASE_URL = "https://custom.api.example.com";
    const creds = getCredentials();
    expect(creds!.baseUrl).toBe("https://custom.api.example.com");
  });

  it("should handle case-insensitive region", () => {
    process.env.KNOWBE4_API_KEY = "test-key";
    process.env.KNOWBE4_REGION = "EU";
    const creds = getCredentials();
    expect(creds!.baseUrl).toBe("https://eu.api.knowbe4.com");
  });
});
