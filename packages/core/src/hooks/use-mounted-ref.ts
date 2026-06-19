// ============================================================
// useMountedRef — check if component is still mounted
// ============================================================

import { useEffect, useRef, useCallback } from 'react';

export function useMountedRef() {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const isMounted = useCallback(() => mountedRef.current, []);

  return { isMounted, mountedRef };
}
