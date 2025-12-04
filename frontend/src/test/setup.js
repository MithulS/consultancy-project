import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
});

// Mock environment variables
globalThis.import.meta.env = {
  VITE_API_URL: 'http://localhost:5000',
};
