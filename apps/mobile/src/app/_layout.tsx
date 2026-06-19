import { DarkTheme, DefaultTheme, ThemeProvider as ExpoThemeProvider } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { I18nProvider } from '@/lib/i18n-context';
import { ThemeProvider, useThemeMode } from '@/lib/theme-context';

function ThemedApp() {
  const { resolved } = useThemeMode();
  return (
    <ExpoThemeProvider value={resolved === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ExpoThemeProvider>
  );
}

export default function TabLayout() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </I18nProvider>
  );
}
