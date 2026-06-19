// 表单 Tab
import {
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useContactFormController } from '@repo/features';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PageContainer } from '@/components/page-container';
import { useT } from '@/lib/i18n-context';
import { useTheme } from '@/hooks/use-theme';
import { mobileFeedback } from '@/lib/feedback';
import { Spacing } from '@/constants/theme';

export default function FormScreen() {
  const t = useT();
  const theme = useTheme();
  const { draft, setName, setPhone, setEmail, setRemark, handleSubmit, handleReset } = useContactFormController({
    platform: 'mobile',
    feedback: mobileFeedback,
    t,
  });

  const inputStyle = [styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }];

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <PageContainer>
            <ThemedText type="subtitle" style={styles.title}>
              {t('form.title')}
            </ThemedText>

            <ThemedView type="backgroundElement" style={styles.card}>
              {/* Name */}
              <ThemedText type="small" themeColor="textSecondary">
                {t('form.name')}
              </ThemedText>
              <TextInput
                style={inputStyle}
                value={draft.name}
                onChangeText={setName}
                placeholder={t('form.namePlaceholder')}
                placeholderTextColor={theme.textTertiary}
              />

              {/* Phone */}
              <ThemedText type="small" themeColor="textSecondary">
                {t('form.phone')}
              </ThemedText>
              <TextInput
                style={inputStyle}
                value={draft.phone}
                onChangeText={setPhone}
                placeholder={t('form.phonePlaceholder')}
                placeholderTextColor={theme.textTertiary}
                keyboardType="phone-pad"
              />

              {/* Email */}
              <ThemedText type="small" themeColor="textSecondary">
                {t('form.email')}
              </ThemedText>
              <TextInput
                style={inputStyle}
                value={draft.email}
                onChangeText={setEmail}
                placeholder={t('form.emailPlaceholder')}
                placeholderTextColor={theme.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Remark */}
              <ThemedText type="small" themeColor="textSecondary">
                {t('form.remark')}
              </ThemedText>
              <TextInput
                style={[inputStyle, styles.textArea]}
                value={draft.remark}
                onChangeText={setRemark}
                placeholder={t('form.remarkPlaceholder')}
                placeholderTextColor={theme.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* Buttons */}
              <ThemedView style={styles.btnRow} type="backgroundElement">
                <TouchableOpacity
                  style={[styles.btnSubmit, { backgroundColor: theme.brand }]}
                  onPress={() => void handleSubmit()}>
                  <ThemedText type="small" style={{ color: theme.white }}>
                    {t('form.submit')}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnReset, { borderColor: theme.border, backgroundColor: theme.background }]}
                  onPress={handleReset}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {t('form.reset')}
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
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
  title: { marginBottom: Spacing.sm },
  card: {
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.md,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  btnSubmit: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.sm,
    alignItems: 'center',
  },
  btnReset: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.sm,
    alignItems: 'center',
  },
});
