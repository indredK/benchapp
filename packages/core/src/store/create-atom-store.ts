// ============================================================
// Store — simple pub/sub atom store (non-React, reusable)
// ============================================================
// This is a minimal store for use in pure TS contexts.
// Each app can wrap it with React bindings (useSyncExternalStore, zustand, etc.)

type Listener<T> = (state: T) => void;

export interface AtomStore<T> {
  getState(): T;
  setState(next: T | ((prev: T) => T)): void;
  subscribe(listener: Listener<T>): () => void;
}

export function createAtomStore<T>(initial: T): AtomStore<T> {
  let state = initial;
  const listeners = new Set<Listener<T>>();

  return {
    getState: () => state,

    setState(next) {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(state) : next;
      if (!Object.is(resolved, state)) {
        state = resolved;
        listeners.forEach((fn) => fn(state));
      }
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
