// Web — centered max-width container
import type { ReactNode } from 'react';
import { View } from 'react-native';

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <View
      // @ts-expect-error web-only style
      style={{
        width: '100%',
        maxWidth: 800,
        marginHorizontal: 'auto',
        paddingHorizontal: 24,
        paddingBottom: 100, // room for bottom tab bar
      }}>
      {children}
    </View>
  );
}
