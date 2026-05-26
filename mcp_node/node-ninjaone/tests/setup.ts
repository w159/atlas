/**
 * Test setup file for Vitest
 */

import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from './mocks/server.js';

// Start the MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Close the server after all tests
afterAll(() => {
  server.close();
});
