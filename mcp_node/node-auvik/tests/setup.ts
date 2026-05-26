import { vi } from 'vitest';

// Mock fetch globally
globalThis.fetch = vi.fn();