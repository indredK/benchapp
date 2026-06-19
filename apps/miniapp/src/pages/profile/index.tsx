// 我的页 (Settings)
import { useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useProfileSettingsController } from '@repo/features';
import { useI18n } from '@/hooks/use-i18n';
import { useTheme } from '@/hooks/use-theme';
import { miniappFeedback } from '@/lib/feedback';
import { lightColors, darkColors } from '@repo/core';
import './index.scss';

export default function ProfilePage() {
  const { t, locale, setLocale } = useI18n();
  const { mode: themeMode, resolved: themeResolved, setMode: setThemeMode } = useTheme();
  const { languageOptions, themeOptions, handleLogout } = useProfileSettingsController({
    feedback: miniappFeedback,
    t,
  });

  // Ensure nav bar matches current theme on this page
  useEffect(() => {
    const c = themeResolved === 'dark' ? darkColors : lightColors;
    Taro.setNavigationBarColor({
      frontColor: themeResolved === 'dark' ? '#ffffff' : '#000000',
      backgroundColor: c.background,
      animation: { duration: 300, timingFunc: 'easeInOut' },
    });
  }, [themeResolved]);

  return (
    <View className={`profile-page profile-page--${themeResolved}`}>
      <View className="profile-page__title">{t('profile.title')}</View>

      {/* --- Settings Section --- */}
      <View className="card">
        {/* Language */}
        <Text className="section-title">{t('settings.language')}</Text>
        <View className="option-row">
          {languageOptions.map((option) => (
            <View
              key={option.key}
              className={`option-btn ${locale === option.key ? 'option-btn--active' : ''}`}
              onClick={() => void setLocale(option.key)}
            >
              <Text
                className={`option-btn__text ${locale === option.key ? 'option-btn__text--active' : ''}`}
              >
                {option.label}
              </Text>
            </View>
          ))}
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
              onClick={() => void setThemeMode(opt.key)}
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
      <View className="logout-btn" onClick={() => void handleLogout()}>
        <Text className="logout-btn__text">{t('settings.logout')}</Text>
      </View>
    </View>
  );
}
