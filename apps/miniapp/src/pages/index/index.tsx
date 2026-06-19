// 组织架构页
import { useEffect } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useOrganizationController } from '@repo/features';
import { useI18n } from '@/hooks/use-i18n';
import { useTheme } from '@/hooks/use-theme';
import { miniappFeedback } from '@/lib/feedback';
import { lightColors, darkColors } from '@repo/core';
import './index.scss';

export default function OrganizationPage() {
  const { t } = useI18n();
  const { resolved: themeResolved } = useTheme();
  const { draft, setSearchText, setDeptName, setMemberName, handleSearch, handleAddDepartment, handleAddMember } =
    useOrganizationController({
      platform: 'miniapp',
      feedback: miniappFeedback,
      t,
    });

  // Ensure nav bar matches current theme
  useEffect(() => {
    const c = themeResolved === 'dark' ? darkColors : lightColors;
    Taro.setNavigationBarColor({
      frontColor: themeResolved === 'dark' ? '#ffffff' : '#000000',
      backgroundColor: c.background,
      animation: { duration: 300, timingFunc: 'easeInOut' },
    });
  }, [themeResolved]);

  return (
    <View className={`org-page org-page--${themeResolved}`}>
      <View className="org-page__title">{t('org.title')}</View>

      {/* Search */}
      <View className="card">
        <Text className="label">{t('org.searchPlaceholder')}</Text>
        <Input
          className="input"
          value={draft.searchText}
          onInput={(e) => setSearchText(e.detail.value)}
          placeholder={t('org.searchPlaceholder')}
        />
        <Button className="btn" onClick={() => void handleSearch()}>{t('org.searchBtn')}</Button>
      </View>

      {/* Add Department */}
      <View className="card">
        <Text className="section-title">{t('org.addDepartment')}</Text>
        <Input
          className="input"
          value={draft.deptName}
          onInput={(e) => setDeptName(e.detail.value)}
          placeholder={t('org.namePlaceholder')}
        />
        <Button className="btn" onClick={() => void handleAddDepartment()}>{t('org.submit')}</Button>
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
        <Button className="btn" onClick={() => void handleAddMember()}>{t('org.submit')}</Button>
      </View>
    </View>
  );
}
