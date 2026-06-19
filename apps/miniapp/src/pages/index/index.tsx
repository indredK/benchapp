// 组织架构页
import { useState, useEffect } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useI18n } from '@/hooks/use-i18n';
import { useTheme } from '@/hooks/use-theme';
import { lightColors, darkColors } from '@repo/core';
import './index.scss';

export default function OrganizationPage() {
  const { t } = useI18n();
  const { resolved: themeResolved } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [deptName, setDeptName] = useState('');
  const [memberName, setMemberName] = useState('');

  // Ensure nav bar matches current theme
  useEffect(() => {
    const c = themeResolved === 'dark' ? darkColors : lightColors;
    Taro.setNavigationBarColor({
      frontColor: themeResolved === 'dark' ? '#ffffff' : '#000000',
      backgroundColor: c.background,
      animation: { duration: 300, timingFunc: 'easeInOut' },
    });
  }, [themeResolved]);

  const handleSearch = () => {
    if (!searchText.trim()) return;
    Taro.showToast({ title: `${t('common.search')}: ${searchText}`, icon: 'none' });
  };

  const handleAddDept = () => {
    if (!deptName.trim()) return;
    Taro.showToast({ title: `${t('org.addDepartment')}: ${deptName}`, icon: 'none' });
    setDeptName('');
  };

  const handleAddMember = () => {
    if (!memberName.trim()) return;
    Taro.showToast({ title: `${t('org.addMember')}: ${memberName}`, icon: 'none' });
    setMemberName('');
  };

  return (
    <View className={`org-page org-page--${themeResolved}`}>
      <View className="org-page__title">{t('org.title')}</View>

      {/* Search */}
      <View className="card">
        <Text className="label">{t('org.searchPlaceholder')}</Text>
        <Input
          className="input"
          value={searchText}
          onInput={(e) => setSearchText(e.detail.value)}
          placeholder={t('org.searchPlaceholder')}
        />
        <Button className="btn" onClick={handleSearch}>{t('org.searchBtn')}</Button>
      </View>

      {/* Add Department */}
      <View className="card">
        <Text className="section-title">{t('org.addDepartment')}</Text>
        <Input
          className="input"
          value={deptName}
          onInput={(e) => setDeptName(e.detail.value)}
          placeholder={t('org.namePlaceholder')}
        />
        <Button className="btn" onClick={handleAddDept}>{t('org.submit')}</Button>
      </View>

      {/* Add Member */}
      <View className="card">
        <Text className="section-title">{t('org.addMember')}</Text>
        <Input
          className="input"
          value={memberName}
          onInput={(e) => setMemberName(e.detail.value)}
          placeholder={t('org.namePlaceholder')}
        />
        <Button className="btn" onClick={handleAddMember}>{t('org.submit')}</Button>
      </View>
    </View>
  );
}
