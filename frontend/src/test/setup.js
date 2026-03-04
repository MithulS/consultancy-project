import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { vi, beforeAll, afterEach } from 'vitest';

// Mock environment variables before any tests run
beforeAll(() => {
  vi.stubEnv('VITE_API_URL', 'http://localhost:5000');
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
});
