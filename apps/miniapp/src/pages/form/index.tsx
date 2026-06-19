// 表单页
import { useEffect } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useContactFormController } from '@repo/features';
import { useI18n } from '@/hooks/use-i18n';
import { useTheme } from '@/hooks/use-theme';
import { miniappFeedback } from '@/lib/feedback';
import { lightColors, darkColors } from '@repo/core';
import './index.scss';

export default function FormPage() {
  const { t } = useI18n();
  const { resolved: themeResolved } = useTheme();
  const { draft, setName, setPhone, setEmail, setRemark, handleSubmit, handleReset } = useContactFormController({
    platform: 'miniapp',
    feedback: miniappFeedback,
    t,
  });

  useEffect(() => {
    const c = themeResolved === 'dark' ? darkColors : lightColors;
    Taro.setNavigationBarColor({
      frontColor: themeResolved === 'dark' ? '#ffffff' : '#000000',
      backgroundColor: c.background,
      animation: { duration: 300, timingFunc: 'easeInOut' },
    });
  }, [themeResolved]);

  return (
    <View className={`form-page form-page--${themeResolved}`}>
      <View className="form-page__title">{t('form.title')}</View>

      <View className="card">
        <Text className="label">{t('form.name')}</Text>
        <Input
          className="input"
          value={draft.name}
          onInput={(e) => setName(e.detail.value)}
          placeholder={t('form.namePlaceholder')}
        />

        <Text className="label">{t('form.phone')}</Text>
        <Input
          className="input"
          type="number"
          value={draft.phone}
          onInput={(e) => setPhone(e.detail.value)}
          placeholder={t('form.phonePlaceholder')}
        />

        <Text className="label">{t('form.email')}</Text>
        <Input
          className="input"
          value={draft.email}
          onInput={(e) => setEmail(e.detail.value)}
          placeholder={t('form.emailPlaceholder')}
        />

        <Text className="label">{t('form.remark')}</Text>
        <Input
          className="input input--textarea"
          value={draft.remark}
          onInput={(e) => setRemark(e.detail.value)}
          placeholder={t('form.remarkPlaceholder')}
        />

        <View className="btn-row">
          <Button className="btn btn--submit" onClick={() => void handleSubmit()}>
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
