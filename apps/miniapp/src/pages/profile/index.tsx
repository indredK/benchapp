// 我的页 (Settings)
import { useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useI18n } from '@/hooks/use-i18n';
import { useTheme } from '@/hooks/use-theme';
import { lightColors, darkColors } from '@repo/core';
import type { ThemeMode } from '@/hooks/use-theme';
import './index.scss';

export default function ProfilePage() {
  const { t, locale, setLocale } = useI18n();
  const { mode: themeMode, resolved: themeResolved, setMode: setThemeMode } = useTheme();

  // Ensure nav bar matches current theme on this page
  useEffect(() => {
    const c = themeResolved === 'dark' ? darkColors : lightColors;
    Taro.setNavigationBarColor({
      frontColor: themeResolved === 'dark' ? '#ffffff' : '#000000',
      backgroundColor: c.background,
      animation: { duration: 300, timingFunc: 'easeInOut' },
    });
  }, [themeResolved]);

  const handleLogout = () => {
    Taro.showModal({
      title: t('settings.logout'),
      content: t('profile.logoutConfirm'),
      confirmText: t('settings.logout'),
      cancelText: t('common.cancel'),
      success: (res) => {
        if (res.confirm) {
          // logout logic
        }
      },
    });
  };

  const themeOptions: { key: ThemeMode; label: string }[] = [
    { key: 'light', label: t('theme.light') },
    { key: 'dark', label: t('theme.dark') },
    { key: 'system', label: t('theme.system') },
  ];

  return (
    <View className={`profile-page profile-page--${themeResolved}`}>
      <View className="profile-page__title">{t('profile.title')}</View>

      {/* --- Settings Section --- */}
      <View className="card">
        {/* Language */}
        <Text className="section-title">{t('settings.language')}</Text>
        <View className="option-row">
          <View
            className={`option-btn ${locale === 'zh-CN' ? 'option-btn--active' : ''}`}
            onClick={() => setLocale('zh-CN')}
          >
            <Text
              className={`option-btn__text ${locale === 'zh-CN' ? 'option-btn__text--active' : ''}`}
            >
              {t('language.zhCN')}
            </Text>
          </View>
          <View
            className={`option-btn ${locale === 'en-US' ? 'option-btn--active' : ''}`}
            onClick={() => setLocale('en-US')}
          >
            <Text
              className={`option-btn__text ${locale === 'en-US' ? 'option-btn__text--active' : ''}`}
            >
              {t('language.enUS')}
            </Text>
          </View>
        </View>

        {/* Theme */}
        <Text className="section-title" style={{ marginTop: '32px' }}>
          {t('settings.theme')}
        </Text>
        <View className="option-row">
          {themeOptions.map((opt) => (
            <View
              key={opt.key}
              className={`option-btn ${themeMode === opt.key ? 'option-btn--active' : ''}`}
              onClick={() => setThemeMode(opt.key)}
            >
              <Text
                className={`option-btn__text ${themeMode === opt.key ? 'option-btn__text--active' : ''}`}
              >
                {opt.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* --- About Section --- */}
      <View className="card">
        <Text className="section-title">{t('profile.about')}</Text>
        <Text className="label">{t('profile.aboutInfo')}</Text>
      </View>

      {/* --- Logout --- */}
      <View className="logout-btn" onClick={handleLogout}>
        <Text className="logout-btn__text">{t('settings.logout')}</Text>
      </View>
    </View>
  );
}
