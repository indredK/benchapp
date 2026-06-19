// 我的 (Settings) Tab
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PageContainer } from '@/components/page-container';
import { useT, useLocale } from '@/lib/i18n-context';
import { useTheme, useThemeMode } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  const t = useT();
  const theme = useTheme();
  const { locale, setLocale } = useLocale();
  const { mode: themeMode, setMode: setThemeMode } = useThemeMode();

  const handleLogout = () => {
    Alert.alert(t('settings.logout'), t('profile.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.logout'), style: 'destructive', onPress: () => {} },
    ]);
  };

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
                {(['zh-CN', 'en-US'] as const).map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.optionBtn,
                      { borderColor: theme.border },
                      locale === lang && { borderColor: theme.brand, backgroundColor: theme.brandLight },
                    ]}
                    onPress={() => setLocale(lang)}>
                    <ThemedText
                      type="small"
                      themeColor={locale === lang ? 'text' : 'textSecondary'}>
                      {t(`language.${lang === 'zh-CN' ? 'zhCN' : 'enUS'}` as any)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Theme */}
              <ThemedText type="smallBold" style={styles.optionLabel}>
                {t('settings.theme')}
              </ThemedText>
              <View style={styles.optionRow}>
                {(['light', 'dark', 'system'] as const).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.optionBtn,
                      { borderColor: theme.border },
                      themeMode === m && { borderColor: theme.brand, backgroundColor: theme.brandLight },
                    ]}
                    onPress={() => setThemeMode(m)}>
                    <ThemedText
                      type="small"
                      themeColor={themeMode === m ? 'text' : 'textSecondary'}>
                      {t(`theme.${m}` as any)}
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
            <TouchableOpacity style={[styles.logoutBtn, { borderColor: theme.error }]} onPress={handleLogout}>
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
