// 组织架构 Tab
import { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useT } from '@/lib/i18n-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export default function OrganizationScreen() {
  const t = useT();
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const [deptName, setDeptName] = useState('');
  const [memberName, setMemberName] = useState('');

  const handleSearch = () => {
    if (!searchText.trim()) return;
    Alert.alert(t('common.search'), `${t('org.searchBtn')}: ${searchText}`);
  };

  const handleAddDept = () => {
    if (!deptName.trim()) return;
    Alert.alert(t('org.addDepartment'), `${t('org.departmentName')}: ${deptName}`);
    setDeptName('');
  };

  const handleAddMember = () => {
    if (!memberName.trim()) return;
    Alert.alert(t('org.addMember'), `${t('org.memberName')}: ${memberName}`);
    setMemberName('');
  };

  const inputStyle = [styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }];
  const btnStyle = [styles.btn, { backgroundColor: theme.brand }];

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemedText type="subtitle" style={styles.title}>
            {t('org.title')}
          </ThemedText>

          {/* Search box */}
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              {t('org.searchPlaceholder')}
            </ThemedText>
            <TextInput
              style={inputStyle}
              value={searchText}
              onChangeText={setSearchText}
              placeholder={t('org.searchPlaceholder')}
              placeholderTextColor={theme.textTertiary}
            />
            <TouchableOpacity style={btnStyle} onPress={handleSearch}>
              <ThemedText type="small" style={{ color: theme.white }}>{t('org.searchBtn')}</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Add Department */}
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold" style={styles.label}>
              {t('org.addDepartment')}
            </ThemedText>
            <TextInput
              style={inputStyle}
              value={deptName}
              onChangeText={setDeptName}
              placeholder={t('org.namePlaceholder')}
              placeholderTextColor={theme.textTertiary}
            />
            <TouchableOpacity style={btnStyle} onPress={handleAddDept}>
              <ThemedText type="small" style={{ color: theme.white }}>{t('org.submit')}</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Add Member */}
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold" style={styles.label}>
              {t('org.addMember')}
            </ThemedText>
            <TextInput
              style={inputStyle}
              value={memberName}
              onChangeText={setMemberName}
              placeholder={t('org.namePlaceholder')}
              placeholderTextColor={theme.textTertiary}
            />
            <TouchableOpacity style={btnStyle} onPress={handleAddMember}>
              <ThemedText type="small" style={{ color: theme.white }}>{t('org.submit')}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: Spacing.four, gap: Spacing.lg },
  title: { marginBottom: Spacing.sm },
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
