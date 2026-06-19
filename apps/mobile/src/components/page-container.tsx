// Native (iOS/Android) — thin wrapper
import type { ReactNode } from 'react';

export function PageContainer({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
