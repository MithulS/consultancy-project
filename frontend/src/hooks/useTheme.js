/**
 * USE THEME HOOK
 * Custom React hook for accessing theme values
 */

import { useMemo } from 'react';
import theme from '../utils/theme';

export function useTheme() {
  // Memoize theme to prevent unnecessary re-renders
  return useMemo(() => theme, []);
}

export default useTheme;
