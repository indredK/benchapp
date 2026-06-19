// ============================================================
// usePagination — pagination state hook
// ============================================================

import { useCallback, useRef } from 'react';

interface PaginationConfig {
  pageSize?: number;
  defaultPage?: number;
}

interface PaginationState {
  page: number;
  pageSize: number;
  hasMore: boolean;
  total: number;
}

export function usePagination(config: PaginationConfig = {}) {
  const { pageSize = 20, defaultPage = 1 } = config;

  const stateRef = useRef<PaginationState>({
    page: defaultPage,
    pageSize,
    hasMore: true,
    total: 0,
  });

  // Internal state sync via ref + forceUpdate pattern
  // Apps should wrap this with their own useState if they need React re-render
  const getState = useCallback((): PaginationState => ({ ...stateRef.current }), []);

  const goToPage = useCallback((page: number) => {
    stateRef.current.page = Math.max(1, page);
    return getState();
  }, [getState]);

  const nextPage = useCallback(() => {
    if (stateRef.current.hasMore) {
      stateRef.current.page += 1;
    }
    return getState();
  }, [getState]);

  const reset = useCallback(() => {
    stateRef.current = { page: defaultPage, pageSize, hasMore: true, total: 0 };
    return getState();
  }, [defaultPage, pageSize, getState]);

  const updateResult = useCallback((total: number, _currentPageSize: number) => {
    stateRef.current.total = total;
    stateRef.current.hasMore = stateRef.current.page * stateRef.current.pageSize < total;
    return getState();
  }, [getState]);

  return { getState, goToPage, nextPage, reset, updateResult };
}
