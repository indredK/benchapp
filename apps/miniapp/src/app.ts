import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { useLaunch } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useI18n } from '@/hooks/use-i18n'
import { useTheme } from '@/hooks/use-theme'
import { lightColors, darkColors } from '@repo/core'

import './app.scss'

const TAB_BAR_ITEMS = [
  { index: 0, key: 'org.title' },
  { index: 1, key: 'form.title' },
  { index: 2, key: 'profile.title' },
]

function App({ children }: PropsWithChildren) {
  const { t, locale } = useI18n()
  const { resolved: themeResolved } = useTheme()

  useLaunch(() => {
    // App launched
  })

  // Sync tab bar text when language changes
  useEffect(() => {
    TAB_BAR_ITEMS.forEach(({ index, key }) => {
      Taro.setTabBarItem({
        index,
        text: t(key),
      })
    })
  }, [locale, t])

  // Sync tab bar & navigation bar style when theme changes
  useEffect(() => {
    const c = themeResolved === 'dark' ? darkColors : lightColors

    Taro.setTabBarStyle({
      color: c.textTertiary,
      selectedColor: c.brand,
      backgroundColor: c.backgroundElement,
      borderStyle: themeResolved === 'dark' ? 'black' : 'white',
    })

    Taro.setNavigationBarColor({
      frontColor: themeResolved === 'dark' ? '#ffffff' : '#000000',
      backgroundColor: c.background,
      animation: { duration: 300, timingFunc: 'easeInOut' },
    })
  }, [themeResolved])

  // children 是将要会渲染的页面
  return children
}

export default App
