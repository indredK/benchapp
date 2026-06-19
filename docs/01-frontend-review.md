# 前端专项审计

本文聚焦四个强制维度：

- 国际化支持（i18n）
- 组件抽象合理性
- 状态管理副作用
- 响应式性能

---

## 1. 文案硬编码导致 i18n 与复用边界失效

### 风险点 (Risk)

`apps/mobile/src/app/index.tsx`、`apps/mobile/src/app/explore.tsx`、`apps/mobile/src/components/app-tabs.tsx`、`apps/mobile/src/components/app-tabs.web.tsx`、`apps/miniapp/src/pages/index/index.tsx` 中的展示文案全部直接写在组件内。

属性：`[前端]`

### 严重性 (Severity)

`High`

### 深度重构 (Refactor)

```ts
// packages/types/src/i18n.ts
export interface AppMessages {
  homeTitle: string;
  exploreTitle: string;
  docsLabel: string;
  tryEditing: string;
}

// packages/core/src/i18n.ts
import type { AppMessages } from '@repo/types/i18n';

export type Locale = 'zh-CN' | 'en-US';

const messages: Record<Locale, AppMessages> = {
  'zh-CN': {
    homeTitle: '首页',
    exploreTitle: '探索',
    docsLabel: '文档',
    tryEditing: '尝试编辑',
  },
  'en-US': {
    homeTitle: 'Home',
    exploreTitle: 'Explore',
    docsLabel: 'Docs',
    tryEditing: 'Try editing',
  },
};

export function getMessages(locale: Locale) {
  return messages[locale];
}
```

```tsx
// apps/mobile/src/app/index.tsx
const locale = 'zh-CN';
const m = getMessages(locale);

<ThemedText type="title">{m.homeTitle}</ThemedText>
<HintRow title={m.tryEditing} hint={<ThemedText type="code">src/app/index.tsx</ThemedText>} />
```

### 设计理念 (Philosophy)

i18n 不是最后一步替换字符串，而是组件输入边界设计的一部分。只要文案写死在 JSX 内，组件就天然无法被多语言、多品牌和多端共用，后续每次需求变更都会演化成分散改文案。

---

## 2. `ThemedView` 的 API 能力与实现不一致

### 风险点 (Risk)

`apps/mobile/src/components/themed-view.tsx` 暴露了 `lightColor` / `darkColor`，但实现完全没有使用，属于伪能力 API。

属性：`[前端]`

### 严重性 (Severity)

`Medium`

### 深度重构 (Refactor)

```tsx
import { View, type ViewProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  type = 'background',
  ...otherProps
}: ThemedViewProps) {
  const theme = useTheme();
  const scheme = useColorScheme();

  const backgroundColor =
    scheme === 'dark' ? darkColor ?? theme[type] : lightColor ?? theme[type];

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
```

### 设计理念 (Philosophy)

抽象层最大的风险不是少功能，而是“签名看上去支持，实际根本不支持”。这种失真会诱导调用方产生错误预期，后续主题换肤时必然出现局部失效和样式旁路。

---

## 3. web 端主题存在 hydration 闪烁与额外重渲染

### 风险点 (Risk)

`apps/mobile/src/hooks/use-color-scheme.web.ts` 首屏固定返回 `light`，hydration 后再更新为真实系统主题。这会让依赖主题的组件至少发生一次额外渲染。

属性：`[前端]`

### 严重性 (Severity)

`Medium`

### 深度重构 (Refactor)

```ts
import { useSyncExternalStore } from 'react';

const mediaQuery =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

function subscribe(callback: () => void) {
  if (!mediaQuery) return () => {};
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function getSnapshot() {
  if (!mediaQuery) return 'light' as const;
  return mediaQuery.matches ? 'dark' : 'light';
}

export function useColorScheme() {
  return useSyncExternalStore(subscribe, getSnapshot, () => 'light');
}
```

### 设计理念 (Philosophy)

主题是全局环境状态，不应该通过 `useEffect + setState` 进行补算。改成订阅模型后，SSR 和客户端的状态源一致，能减少首屏闪烁和无意义重排。

---

## 4. 窄屏布局在真实文案下容易互挤

### 风险点 (Risk)

`apps/mobile/src/components/hint-row.tsx` 使用 `space-between` 布局标题和代码片段，但未定义收缩优先级、换行策略与最大宽度。`apps/mobile/src/components/app-tabs.web.tsx` 也把品牌、Tab、外链全部压在一个横排里。

属性：`[前端]`

### 严重性 (Severity)

`Medium`

### 深度重构 (Refactor)

```tsx
const styles = StyleSheet.create({
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  title: {
    flexShrink: 1,
    minWidth: 96,
  },
  codeSnippet: {
    flexShrink: 1,
    maxWidth: '100%',
  },
  innerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: Spacing.two,
    columnGap: Spacing.two,
    alignItems: 'center',
  },
});
```

### 设计理念 (Philosophy)

响应式设计不是“界面能缩小”就算过关，而是必须定义文本、按钮、导航条在狭窄宽度下的优先级。否则一旦接入中文长文案或多语言，布局必然破裂。

---

## 5. 动画实现没有服从性能预算和无障碍偏好

### 风险点 (Risk)

`apps/mobile/src/components/animated-icon.tsx` 的 glow 连续旋转时间过长，且首屏遮罩会压住内容展示。这种模板动画在真实业务页面里很容易成为性能噪声。

属性：`[前端]`

### 严重性 (Severity)

`Medium`

### 深度重构 (Refactor)

```tsx
import { AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';

export function AnimatedIcon() {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotionEnabled);
  }, []);

  if (reduceMotionEnabled) {
    return <StaticLogo />;
  }

  return <AnimatedLogo enterDuration={300} loop={false} />;
}
```

### 设计理念 (Philosophy)

动画应该服务于首屏感知，而不是长期占用渲染预算。把动效降为一次性进入态，并尊重减少动态效果设置，才能避免性能波动和可访问性问题。

---

## 6. Taro 入口仍残留模板级弱类型与调试噪声

### 风险点 (Risk)

`apps/miniapp/src/app.ts` 使用 `PropsWithChildren<any>`，`apps/miniapp/src/pages/index/index.tsx` 保留了直接 `console.log`。

属性：`[前端]`

### 严重性 (Severity)

`Low`

### 深度重构 (Refactor)

```tsx
import type { PropsWithChildren } from 'react';

type AppProps = PropsWithChildren;

function App({ children }: AppProps) {
  return children;
}
```

### 设计理念 (Philosophy)

模板项目里最容易被放过的是 `any` 和调试日志，但它们会直接降低后续静态检查密度。类型边界松了，状态与副作用问题就更容易混入主流程。
