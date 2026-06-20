// 组织架构页
import { useState, useMemo, useEffect } from 'react';
import { View, Text, Input, Button, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useOrganizationController } from '@repo/features';
import { useI18n } from '@/hooks/use-i18n';
import { useTheme } from '@/hooks/use-theme';
import { miniappFeedback } from '@/lib/feedback';
import { apiClient } from '@/lib/api-client';
import { lightColors, darkColors } from '@repo/core';
import { EmptyState } from '@/components/empty-state';
import './index.scss';

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

export default function OrganizationPage() {
  const { t } = useI18n();
  const { resolved: themeResolved } = useTheme();
  const {
    draft,
    setSearchText,
    setDeptName,
    setMemberName,
    handleSearch,
    handleAddDepartment,
    handleAddMember,
  } = useOrganizationController({ platform: 'miniapp', feedback: miniappFeedback, t });

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

  useEffect(() => {
    const c = themeResolved === 'dark' ? darkColors : lightColors;
    Taro.setNavigationBarColor({
      frontColor: themeResolved === 'dark' ? '#ffffff' : '#000000',
      backgroundColor: c.background,
      animation: { duration: 300, timingFunc: 'easeInOut' },
    });
  }, [themeResolved]);

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

  return (
    <View className={`org-page org-page--${themeResolved}`}>
      <View className="org-page__title">{t('org.title')}</View>

      {/* Search */}
      <View className="card">
        <Input
          className="input"
          value={draft.searchText}
          onInput={(e) => setSearchText(e.detail.value)}
          placeholder={t('org.searchPlaceholder')}
          confirmType="search"
          onConfirm={() => void handleSearch()}
        />
        <Button className="btn" onClick={() => void handleSearch()}>
          {t('org.searchBtn')}
        </Button>
      </View>

      {/* Department Tabs */}
      <ScrollView scrollX className="dept-scroll">
        <View className="dept-chips">
          <View
            className={`dept-chip ${!selectedDept ? 'dept-chip--active' : ''}`}
            onClick={() => setSelectedDept(null)}
          >
            <Text className={`dept-chip__text ${!selectedDept ? 'dept-chip__text--active' : ''}`}>
              {t('org.department')}
            </Text>
          </View>
          {deps.map((d) => (
            <View
              key={d.id}
              className={`dept-chip ${selectedDept === d.id ? 'dept-chip--active' : ''}`}
              onClick={() => setSelectedDept(d.id)}
            >
              <Text
                className={`dept-chip__text ${selectedDept === d.id ? 'dept-chip__text--active' : ''}`}
              >
                {d.name} ({d.memberCount})
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Selected Department Header */}
      {selectedDept && <Text className="org-section-label">{deptById(selectedDept)?.name}</Text>}

      {/* Member List */}
      {filteredMembers.length === 0 ? (
        <EmptyState description={draft.searchText ? t('common.noData') : undefined} />
      ) : (
        <View>
          {filteredMembers.map((m) => (
            <View key={m.id} className={`member-row member-row--${themeResolved}`}>
              <Image className="member-avatar" src={m.avatar} mode="aspectFill" />
              <View className="member-info">
                <Text className="member-name">{m.name}</Text>
                <Text className="member-role">{m.role}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Add Department */}
      <View className="card" style={{ marginTop: '32px' }}>
        <Text className="section-title">{t('org.addDepartment')}</Text>
        <Input
          className="input"
          value={draft.deptName}
          onInput={(e) => setDeptName(e.detail.value)}
          placeholder={t('org.namePlaceholder')}
        />
        <Button className="btn" onClick={() => void handleAddDepartment()}>
          {t('org.submit')}
        </Button>
      </View>

      {/* Add Member */}
      <View className="card">
        <Text className="section-title">{t('org.addMember')}</Text>
        <Input
          className="input"
          value={draft.memberName}
          onInput={(e) => setMemberName(e.detail.value)}
          placeholder={t('org.namePlaceholder')}
        />
        <Button className="btn" onClick={() => void handleAddMember()}>
          {t('org.submit')}
        </Button>
      </View>
    </View>
  );
}
