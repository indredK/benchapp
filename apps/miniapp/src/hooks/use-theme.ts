// ============================================================
// MiniApp — Theme hook (light / dark / system)
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { miniappStorage } from '@/lib/storage';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'app_theme';

let globalMode: ThemeMode = 'system';
let globalResolved: ResolvedTheme = 'light';
const listeners = new Set<(mode: ThemeMode, resolved: ResolvedTheme) => void>();

function notifyAll(mode: ThemeMode, resolved: ResolvedTheme) {
  listeners.forEach((fn) => fn(mode, resolved));
}

function resolveSystemTheme(): ResolvedTheme {
  try {
    const sysInfo = Taro.getSystemInfoSync();
    return sysInfo.theme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  return mode === 'system' ? resolveSystemTheme() : mode;
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(globalMode);
  const [resolved, setResolved] = useState<ResolvedTheme>(globalResolved);

  useEffect(() => {
    // Hydrate from storage
    miniappStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          globalMode = saved;
          globalResolved = resolveTheme(globalMode);
          notifyAll(globalMode, globalResolved);
          setModeState(globalMode);
          setResolved(globalResolved);
        }
      })
      .catch(() => {
        setModeState(globalMode);
        setResolved(globalResolved);
      });

    const listener = (m: ThemeMode, r: ResolvedTheme) => {
      setModeState(m);
      setResolved(r);
    };
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    globalMode = next;
    globalResolved = resolveTheme(next);
    miniappStorage.setItem(STORAGE_KEY, next).catch(() => {});
    notifyAll(globalMode, globalResolved);
    setModeState(globalMode);
    setResolved(globalResolved);
  }, []);

  return { mode, resolved, setMode };
}
