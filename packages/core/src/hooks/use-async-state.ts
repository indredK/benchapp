// ============================================================
// useAsyncState — async resource state machine
// ============================================================

import { useCallback, useReducer } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface State<T> {
  data: T | null;
  status: Status;
  error: Error | null;
}

type Action<T> =
  | { type: 'loading' }
  | { type: 'success'; data: T }
  | { type: 'error'; error: Error }
  | { type: 'reset' };

function reducer<T>(state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case 'loading': return { data: state.data, status: 'loading', error: null };
    case 'success': return { data: action.data, status: 'success', error: null };
    case 'error': return { data: state.data, status: 'error', error: action.error };
    case 'reset': return { data: null, status: 'idle', error: null };
  }
}

export function useAsyncState<T>(initialData?: T | null) {
  const [state, dispatch] = useReducer(reducer<T>, {
    data: initialData ?? null,
    status: 'idle',
    error: null,
  });

  const run = useCallback(async (promise: Promise<T>) => {
    dispatch({ type: 'loading' });
    try {
      const data = await promise;
      dispatch({ type: 'success', data });
      return data;
    } catch (err) {
      dispatch({ type: 'error', error: err instanceof Error ? err : new Error(String(err)) });
      throw err;
    }
  }, []);

  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  return { ...state, run, reset, isLoading: state.status === 'loading', isSuccess: state.status === 'success', isError: state.status === 'error' };
}
