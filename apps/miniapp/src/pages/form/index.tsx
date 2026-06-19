// 表单页
import { useState, useEffect } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useI18n } from '@/hooks/use-i18n';
import { useTheme } from '@/hooks/use-theme';
import { lightColors, darkColors } from '@repo/core';
import './index.scss';

export default function FormPage() {
  const { t } = useI18n();
  const { resolved: themeResolved } = useTheme();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [remark, setRemark] = useState('');

  // Ensure nav bar matches current theme
  useEffect(() => {
    const c = themeResolved === 'dark' ? darkColors : lightColors;
    Taro.setNavigationBarColor({
      frontColor: themeResolved === 'dark' ? '#ffffff' : '#000000',
      backgroundColor: c.background,
      animation: { duration: 300, timingFunc: 'easeInOut' },
    });
  }, [themeResolved]);

  const handleSubmit = () => {
    Taro.showToast({ title: t('form.submitSuccess'), icon: 'success' });
  };

  const handleReset = () => {
    setName('');
    setPhone('');
    setEmail('');
    setRemark('');
  };

  return (
    <View className={`form-page form-page--${themeResolved}`}>
      <View className="form-page__title">{t('form.title')}</View>

      <View className="card">
        <Text className="label">{t('form.name')}</Text>
        <Input
          className="input"
          value={name}
          onInput={(e) => setName(e.detail.value)}
          placeholder={t('form.namePlaceholder')}
        />

        <Text className="label">{t('form.phone')}</Text>
        <Input
          className="input"
          type="number"
          value={phone}
          onInput={(e) => setPhone(e.detail.value)}
          placeholder={t('form.phonePlaceholder')}
        />

        <Text className="label">{t('form.email')}</Text>
        <Input
          className="input"
          value={email}
          onInput={(e) => setEmail(e.detail.value)}
          placeholder={t('form.emailPlaceholder')}
        />

        <Text className="label">{t('form.remark')}</Text>
        <Input
          className="input input--textarea"
          value={remark}
          onInput={(e) => setRemark(e.detail.value)}
          placeholder={t('form.remarkPlaceholder')}
        />

        <View className="btn-row">
          <Button className="btn btn--submit" onClick={handleSubmit}>
            {t('form.submit')}
          </Button>
          <Button className="btn btn--reset" onClick={handleReset}>
            {t('form.reset')}
          </Button>
        </View>
      </View>
    </View>
  );
}
