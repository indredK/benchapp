// 组织架构 Tab
import { useState, useMemo, useEffect } from 'react';
import {
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrganizationController } from '@repo/features';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EmptyState } from '@/components/empty-state';
import { PageContainer } from '@/components/page-container';
import { useT } from '@/lib/i18n-context';
import { useTheme } from '@/hooks/use-theme';
import { mobileFeedback } from '@/lib/feedback';
import { apiClient } from '@/lib/api-client';
import { Spacing } from '@/constants/theme';

interface OrgDepartment {
  id: string;
  name: string;
  parentId: string | null;
  memberCount: number;
}
interface OrgMember {
  id: string;
  name: string;
  departmentId: string;
  role: string;
  avatar: string;
}

export default function OrganizationScreen() {
  const t = useT();
  const theme = useTheme();
  const {
    draft,
    setSearchText,
    setDeptName,
    setMemberName,
    handleSearch,
    handleAddDepartment,
    handleAddMember,
  } = useOrganizationController({ platform: 'mobile', feedback: mobileFeedback, t });

  const [deps, setDeps] = useState<OrgDepartment[]>([]);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiClient.get<OrgDepartment[]>('/api/org/departments'),
      apiClient.get<OrgMember[]>('/api/org/members'),
    ])
      .then(([d, m]) => {
        if (Array.isArray(d)) setDeps(d);
        if (Array.isArray(m)) setMembers(m);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredMembers = useMemo(() => {
    let list = selectedDept ? members.filter((m) => m.departmentId === selectedDept) : members;
    if (draft.searchText.trim()) {
      const kw = draft.searchText.toLowerCase();
      list = list.filter(
        (m) => m.name.toLowerCase().includes(kw) || m.role.toLowerCase().includes(kw),
      );
    }
    return list;
  }, [members, selectedDept, draft.searchText]);

  const deptById = (id: string) => deps.find((d) => d.id === id);

  const inputStyle = [
    styles.input,
    { borderColor: theme.border, color: theme.text, backgroundColor: theme.background },
  ];
  const btnStyle = [styles.btn, { backgroundColor: theme.brand }];

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <FlatList
          data={filteredMembers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scroll}
          ListHeaderComponent={() => (
            <PageContainer>
              <ThemedText type="subtitle" style={styles.title}>
                {t('org.title')}
              </ThemedText>

              {/* Search */}
              <ThemedView type="backgroundElement" style={styles.card}>
                <TextInput
                  style={[inputStyle, { marginBottom: Spacing.sm }]}
                  value={draft.searchText}
                  onChangeText={setSearchText}
                  placeholder={t('org.searchPlaceholder')}
                  placeholderTextColor={theme.textTertiary}
                  onSubmitEditing={() => void handleSearch()}
                />
                <TouchableOpacity style={btnStyle} onPress={() => void handleSearch()}>
                  <ThemedText type="small" style={{ color: theme.white }}>
                    {t('org.searchBtn')}
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>

              {/* Department Tabs */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deptRow}>
                <TouchableOpacity
                  style={[
                    styles.deptChip,
                    !selectedDept && { backgroundColor: theme.brand, borderColor: theme.brand },
                  ]}
                  onPress={() => setSelectedDept(null)}
                >
                  <ThemedText
                    type="small"
                    style={{ color: !selectedDept ? theme.white : theme.textSecondary }}
                  >
                    {t('org.department')}
                  </ThemedText>
                </TouchableOpacity>
                {deps.map((d) => (
                  <TouchableOpacity
                    key={d.id}
                    style={[
                      styles.deptChip,
                      selectedDept === d.id && {
                        backgroundColor: theme.brand,
                        borderColor: theme.brand,
                      },
                    ]}
                    onPress={() => setSelectedDept(d.id)}
                  >
                    <ThemedText
                      type="small"
                      style={{ color: selectedDept === d.id ? theme.white : theme.textSecondary }}
                    >
                      {d.name} ({d.memberCount})
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {selectedDept && (
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  style={{ paddingLeft: Spacing.xs, marginBottom: Spacing.sm }}
                >
                  {deptById(selectedDept)?.name}
                </ThemedText>
              )}
            </PageContainer>
          )}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: Spacing.four }}>
              <ThemedView type="backgroundElement" style={styles.memberRow}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <ThemedText type="smallBold">{item.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {item.role}
                  </ThemedText>
                </View>
              </ThemedView>
            </View>
          )}
          ListEmptyComponent={() => (
            <EmptyState description={draft.searchText ? t('common.noData') : undefined} />
          )}
          ListFooterComponent={() => (
            <PageContainer>
              {/* Add Department */}
              <ThemedView type="backgroundElement" style={[styles.card, { marginTop: Spacing.lg }]}>
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
                  <ThemedText type="small" style={{ color: theme.white }}>
                    {t('org.submit')}
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>

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
                  <ThemedText type="small" style={{ color: theme.white }}>
                    {t('org.submit')}
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </PageContainer>
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingBottom: Spacing.xl },
  title: { marginBottom: Spacing.lg },
  card: {
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Spacing.md,
    marginBottom: Spacing.md,
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
  deptRow: { marginBottom: Spacing.md, paddingLeft: Spacing.four },
  deptChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: Spacing.sm,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F0F3' },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Spacing.md,
    marginBottom: Spacing.sm,
  },
});
