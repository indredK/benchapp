// 组织架构 Tab
import {
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrganizationController } from '@repo/features';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PageContainer } from '@/components/page-container';
import { useT } from '@/lib/i18n-context';
import { useTheme } from '@/hooks/use-theme';
import { mobileFeedback } from '@/lib/feedback';
import { Spacing } from '@/constants/theme';

export default function OrganizationScreen() {
  const t = useT();
  const theme = useTheme();
  const { draft, setSearchText, setDeptName, setMemberName, handleSearch, handleAddDepartment, handleAddMember } =
    useOrganizationController({
      platform: 'mobile',
      feedback: mobileFeedback,
      t,
    });

  const inputStyle = [styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }];
  const btnStyle = [styles.btn, { backgroundColor: theme.brand }];

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <PageContainer>
            <ThemedText type="subtitle" style={styles.title}>
              {t('org.title')}
            </ThemedText>

            <View style={styles.gap} />

            {/* Search box */}
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
                {t('org.searchPlaceholder')}
              </ThemedText>
              <TextInput
                style={inputStyle}
                value={draft.searchText}
                onChangeText={setSearchText}
                placeholder={t('org.searchPlaceholder')}
                placeholderTextColor={theme.textTertiary}
              />
              <TouchableOpacity style={btnStyle} onPress={() => void handleSearch()}>
                <ThemedText type="small" style={{ color: theme.white }}>{t('org.searchBtn')}</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            <View style={styles.gap} />

            {/* Add Department */}
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold" style={styles.label}>
                {t('org.addDepartment')}
              </ThemedText>
              <TextInput
                style={inputStyle}
                value={draft.deptName}
                onChangeText={setDeptName}
                placeholder={t('org.namePlaceholder')}
                placeholderTextColor={theme.textTertiary}
              />
              <TouchableOpacity style={btnStyle} onPress={() => void handleAddDepartment()}>
                <ThemedText type="small" style={{ color: theme.white }}>{t('org.submit')}</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            <View style={styles.gap} />

            {/* Add Member */}
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold" style={styles.label}>
                {t('org.addMember')}
              </ThemedText>
              <TextInput
                style={inputStyle}
                value={draft.memberName}
                onChangeText={setMemberName}
                placeholder={t('org.namePlaceholder')}
                placeholderTextColor={theme.textTertiary}
              />
              <TouchableOpacity style={btnStyle} onPress={() => void handleAddMember()}>
                <ThemedText type="small" style={{ color: theme.white }}>{t('org.submit')}</ThemedText>
              </TouchableOpacity>
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
  title: { marginBottom: 0 },
  gap: { height: Spacing.lg },
  card: {
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Spacing.md,
  },
  label: { marginBottom: Spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    fontSize: 16,
  },
  btn: {
    paddingVertical: Spacing.md,
    borderRadius: Spacing.sm,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
});
