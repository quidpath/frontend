import { useState, useEffect, useCallback } from 'react';

/**
 * Hook that persists state to localStorage
 * Automatically syncs state across tabs/windows
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Initialize state from localStorage or default
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  // Listen for changes in other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setState(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  // Clear function
  const clear = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.removeItem(key);
      setState(defaultValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [state, setState, clear];
}

/**
 * Hook for persisting tab state
 */
export function usePersistedTab(moduleKey: string, defaultTab: number = 0) {
  return usePersistedState<number>(`${moduleKey}-active-tab`, defaultTab);
}

/**
 * Hook for persisting filter state
 */
export function usePersistedFilters<T extends Record<string, unknown>>(
  moduleKey: string,
  defaultFilters: T
) {
  return usePersistedState<T>(`${moduleKey}-filters`, defaultFilters);
}

/**
 * Hook for persisting search state
 */
export function usePersistedSearch(moduleKey: string, defaultSearch: string = '') {
  return usePersistedState<string>(`${moduleKey}-search`, defaultSearch);
}

/**
 * Hook for persisting scroll position
 */
export function usePersistedScroll(moduleKey: string) {
  const [scrollPosition, setScrollPosition] = usePersistedState<number>(
    `${moduleKey}-scroll`,
    0
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Restore scroll position on mount
    window.scrollTo(0, scrollPosition);

    // Save scroll position on scroll
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollPosition;
}
