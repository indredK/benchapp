// 我的 (Settings) Tab
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileSettingsController } from '@repo/features';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PageContainer } from '@/components/page-container';
import { useT, useLocale } from '@/lib/i18n-context';
import { useTheme, useThemeMode } from '@/hooks/use-theme';
import { mobileFeedback } from '@/lib/feedback';
import { Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  const t = useT();
  const theme = useTheme();
  const { locale, setLocale } = useLocale();
  const { mode: themeMode, setMode: setThemeMode } = useThemeMode();
  const { languageOptions, themeOptions, handleLogout } = useProfileSettingsController({
    feedback: mobileFeedback,
    t,
  });

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <PageContainer>
            <ThemedText type="subtitle" style={styles.pageTitle}>
              {t('profile.title')}
            </ThemedText>

            {/* --- Settings Section --- */}
            <ThemedView type="backgroundElement" style={styles.card}>
              {/* Language */}
              <ThemedText type="smallBold">{t('settings.language')}</ThemedText>
              <View style={styles.optionRow}>
                {languageOptions.map((lang) => (
                  <TouchableOpacity
                    key={lang.key}
                    style={[
                      styles.optionBtn,
                      { borderColor: theme.border },
                      locale === lang.key && { borderColor: theme.brand, backgroundColor: theme.brandLight },
                    ]}
                    onPress={() => void setLocale(lang.key)}>
                    <ThemedText
                      type="small"
                      themeColor={locale === lang.key ? 'text' : 'textSecondary'}>
                      {lang.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Theme */}
              <ThemedText type="smallBold" style={styles.optionLabel}>
                {t('settings.theme')}
              </ThemedText>
              <View style={styles.optionRow}>
                {themeOptions.map((m) => (
                  <TouchableOpacity
                    key={m.key}
                    style={[
                      styles.optionBtn,
                      { borderColor: theme.border },
                      themeMode === m.key && { borderColor: theme.brand, backgroundColor: theme.brandLight },
                    ]}
                    onPress={() => void setThemeMode(m.key)}>
                    <ThemedText
                      type="small"
                      themeColor={themeMode === m.key ? 'text' : 'textSecondary'}>
                      {m.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </ThemedView>

            {/* --- About Section --- */}
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">{t('profile.about')}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {t('profile.aboutInfo')}
              </ThemedText>
            </ThemedView>

            {/* --- Logout --- */}
            <TouchableOpacity style={[styles.logoutBtn, { borderColor: theme.error }]} onPress={() => void handleLogout()}>
              <ThemedText type="small" themeColor="error">
                {t('settings.logout')}
              </ThemedText>
            </TouchableOpacity>
          </PageContainer>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: Spacing.four },
  pageTitle: { marginBottom: Spacing.lg },
  card: {
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Spacing.md,
    marginBottom: Spacing.lg,
  },
  optionLabel: { marginTop: Spacing.sm },
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  logoutBtn: {
    paddingVertical: Spacing.md,
    borderRadius: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
});
