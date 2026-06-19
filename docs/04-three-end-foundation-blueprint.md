# 三端基础设施建设蓝图

## 适用范围

本文不是泛化的前端基建清单，而是基于当前仓库的真实情况制定的基础设施建设方案。

当前仓库实际对应的是“两套应用代码，三类运行端”：

1. `apps/mobile`
   - Expo Router
   - 运行在 iOS / Android / Web
2. `apps/miniapp`
   - Taro + React
   - 运行在微信小程序，后续也可扩到 H5 / 其他小程序平台

因此，这里的“三端”按建设目标应理解为：

- App 端（iOS / Android）
- Web 端
- 小程序端

## 先说结论

这套项目不适合一开始就追求“组件跨三端完全复用”。按当前技术栈，真正应该沉淀的是：

- 请求协议层
- 领域层纯函数
- hooks 设计规范
- i18n 资源与语言状态
- 主题 token 与主题状态
- 存储、错误、鉴权、环境配置等系统能力

不应该强行统一的是：

- Expo 组件和 Taro 组件
- Expo Router 与 Taro 路由
- React Native 样式层与小程序样式层
- 各端直接依赖的设备 API

换句话说，三端共享的重点是“能力边界”，不是“UI 代码复制”。

---

## 一、当前项目实际情况

### 已有基础

- root 已经是 `pnpm workspace`
- 预留了 `@repo/core` / `@repo/api` / `@repo/types`
- `apps/mobile` 有最基础的主题 hook
- `apps/miniapp` 仍处于模板起步阶段

### 当前缺失

- 共享包是空壳，没有真实 `src/`
- 没有统一请求层
- 没有统一错误模型
- 没有统一存储层
- 没有统一 i18n 资源与语言切换方案
- 没有统一主题状态，只存在局部颜色选择
- 没有统一 hooks 分层约定
- 没有运行时环境配置体系
- 没有鉴权 / session 基础设施

所以现在开始做基础设施是对的，时机也对。再晚一点，业务代码会先把这些边界冲烂。

---

## 二、三端基建原则

## 1. 共享纯逻辑，不共享运行时细节

可共享：

- 类型
- DTO
- 常量
- 错误码
- 请求契约
- 语言包
- 主题 token
- 纯函数
- 与 UI 无关的 hooks 组合逻辑

不可直接共享：

- React Native 组件
- Taro 组件
- Router API
- 小程序 API 与 Expo API 的直接调用

## 2. 所有系统能力必须先抽象接口，再接具体平台

例如：

- 请求：先有 `HttpAdapter`，再接 `fetch` / `Taro.request`
- 存储：先有 `StorageAdapter`，再接 `AsyncStorage` / `localStorage` / `Taro.setStorage`
- 语言：先有 `LocaleAdapter`，再接设备语言与本地持久化
- 主题：先有 `ThemeStore`，再接各端的展示层

## 3. hooks 分层必须明确

不要把所有东西都叫 `useXxx`。三端项目里，hook 至少应分三层：

- `platform hooks`：直接碰平台 API
- `domain hooks`：组合业务逻辑，不碰平台 API
- `ui hooks`：只服务当前应用 UI

这样后续迁移和测试才不会失控。

---

## 三、建议的 workspace 结构

```text
packages/
  types/
    src/
      index.ts
      api.ts
      i18n.ts
      theme.ts
  core/
    src/
      index.ts
      constants/
      utils/
      i18n/
      theme/
      hooks/
      store/
  api/
    src/
      index.ts
      client/
      adapters/
      errors/
      auth/
      contracts/
```

### 包职责

#### `@repo/types`

只放类型，不放运行时代码：

- 请求/响应 DTO
- 错误码类型
- locale 类型
- theme 类型
- 通用分页类型

#### `@repo/core`

放纯逻辑和通用状态，不直接依赖 Expo/Taro：

- i18n 资源
- theme token
- 纯工具函数
- domain hooks
- 通用 store
- 格式化能力

#### `@repo/api`

放网络请求相关基础设施：

- request client
- adapter 接口
- auth header 注入
- retry / timeout 策略
- 错误归一化
- mock / fixtures

---

## 四、网络请求基础设施

这是第一优先级，因为后续 hooks、鉴权、缓存、错误处理都依赖它。

## 设计目标

- App / Web / 小程序使用同一套 API 契约
- 平台差异只留在 adapter 层
- 业务层不直接写裸请求
- 每个请求都有统一的超时、重试、错误映射和鉴权头注入

## 建议结构

```text
packages/api/src/
  client/
    create-api-client.ts
    request.ts
  adapters/
    http-adapter.ts
    fetch-adapter.ts
    taro-request-adapter.ts
  auth/
    token-provider.ts
  errors/
    api-error.ts
    normalize-error.ts
  contracts/
    user.ts
    common.ts
```

## 核心接口建议

```ts
export interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  withAuth?: boolean;
}

export interface HttpAdapter {
  request<T>(options: RequestOptions): Promise<T>;
}

export interface TokenProvider {
  getAccessToken(): Promise<string | null>;
  clearAccessToken(): Promise<void>;
}
```

## 三端适配方式

### App / Web

优先使用 `fetch` adapter。

原因：

- Expo 与 web 都天然可用
- 能减少引入额外依赖
- 便于后续 SSR / edge 兼容思维

### 小程序

单独使用 `Taro.request` adapter。

原因：

- 小程序网络层与浏览器并不完全等价
- 上传、下载、header、cookie 行为和 web 不同
- 强行共用 `fetch` 会让兼容层变脆

## 请求层必须一并做掉的能力

- baseURL 管理
- query 拼接
- JSON 编码/解码
- 超时控制
- 重试策略
- 401 处理
- 错误码归一化
- requestId 透传预留

## 不建议现在就做的

- 全局拦截器写成一团魔法
- 把业务错误直接映射成 toast
- 在页面里手写 token 拼接

---

## 五、hooks 基础设施

hooks 不是越多越好，而是分层越清楚越好。

## 建议分类

### 1. 平台 hooks

放各应用内，不进共享包：

- `useAppColorScheme`
- `useSafeAreaInsets`
- `useMiniappPageVisible`
- `useKeyboard`
- `useNetworkStatus`

这些 hook 直接碰平台能力，不应该被伪装成跨端 hook。

### 2. 领域 hooks

尽量放 `@repo/core`：

- `useLocaleState`
- `useThemeState`
- `useSessionState`
- `usePaginationState`
- `useFiltersState`

这些 hook 不该依赖 React Native 或 Taro API，只依赖抽象接口。

### 3. 请求 hooks

建议先做“query function + app 内 hook 包装”，不要急着追求三端一把梭：

```ts
// @repo/api
export async function getCurrentUser(client: ApiClient) {
  return client.get('/user/me');
}
```

```ts
// apps/mobile
export function useCurrentUser() {
  return useAsyncResource(() => getCurrentUser(apiClient));
}
```

```ts
// apps/miniapp
export function useCurrentUser() {
  return useAsyncResource(() => getCurrentUser(apiClient));
}
```

## 为什么不建议一开始就把所有请求 hook 放共享层

因为当前项目是 Expo + Taro 双 runtime。即使都叫 React，生命周期、页面缓存、页面显示时机和错误弹出方式也不一样。先统一 query function 和状态模型，后统一 hook 外壳，风险更低。

## hooks 基建还应补什么

- `useAsyncState`
- `useDebouncedValue`
- `usePagination`
- `usePullToRefreshState`
- `useInfiniteScrollGuard`
- `useMountedRef`

这些属于三端都高频需要的行为能力。

---

## 六、多语言基础设施

多语言应该现在做，不应该等业务页面多起来再做。

## 设计目标

- 三端共用一套 messages
- 三端共用 locale key
- 各端只负责“如何拿到当前语言”和“如何持久化”

## 建议结构

```text
packages/core/src/i18n/
  index.ts
  messages/
    zh-CN.ts
    en-US.ts
  formatters/
    date.ts
    number.ts
```

## 状态模型建议

```ts
export type Locale = 'zh-CN' | 'en-US';

export interface I18nState {
  locale: Locale;
  fallbackLocale: Locale;
}
```

## 三端适配

### App / Web

- 初始值可来自设备语言
- 用户选择后存入本地存储

### 小程序

- 初始值来自小程序运行环境语言或本地缓存
- 切换后存储到小程序本地缓存

## 一并要做的能力

- `t(key)` 基础翻译函数
- 参数插值
- fallback 语言
- 日期/数字/货币格式化封装
- locale 持久化

## 不建议现在做的

- 过度复杂的 message namespace
- 把业务变量直接拼进字符串
- 组件里继续写硬编码中文/英文

---

## 七、主题切换基础设施

当前 `apps/mobile` 已有非常初级的主题颜色选择，但还没有系统性的 theme 基建。

## 设计目标

- 三端共用一套 design token
- 三端共用主题状态
- UI 层各自消费 token
- 支持 `light` / `dark` / `system`

## 建议结构

```text
packages/core/src/theme/
  tokens.ts
  themes.ts
  theme-types.ts
  theme-store.ts
```

## 状态模型建议

```ts
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
}
```

## 当前项目里应该怎么做

### 共享层

- `tokens`
- `theme state`
- `resolveTheme(mode, systemTheme)`
- 颜色、间距、字体、圆角、层级定义

### `apps/mobile`

- 接 Expo / RN 的系统主题
- 接现有 `ThemeProvider`
- 替换现在零散的 `Colors`

### `apps/miniapp`

- 用主题 class 或 data attribute 驱动样式
- 通过运行时状态切换 `light/dark`

## 一并该做的

- 主题持久化
- system mode 解析
- 主题切换 hook
- token 类型约束

## 不建议现在做的

- 组件里散落直接颜色值
- 同时维护两套不一致的 token 命名
- 主题切换只做颜色，不做语义 token

---

## 八、除了请求 / hooks / i18n / 主题，还应该一起建设什么

下面这些不是“可选锦上添花”，而是三端项目很快就会需要的系统能力。

## 1. 环境配置体系

建议建设：

- `dev` / `test` / `prod` 配置
- `baseURL`
- feature 开关
- 日志级别

原因：

三端项目最怕每端自己写一套环境判断，最后线上地址和调试地址各不相同。

## 2. 存储层

建议抽象：

```ts
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
```

三端分别接：

- App: 本地异步存储
- Web: localStorage 或其他 web 存储
- 小程序: Taro storage

它会被以下能力复用：

- token
- locale
- theme
- onboarding 标记
- 草稿箱

## 3. session / 鉴权层

建议尽早定义：

- token 读取接口
- 登录态 store
- 401 清理流程
- 访客态与登录态切换

否则之后每个页面都会偷偷处理一遍登录态。

## 4. 错误模型与异常处理

建议统一：

- `AppError`
- `BizErrorCode`
- 网络错误 / 业务错误 / 未知错误分类
- 页面错误态和 toast 触发边界

这是请求层之后最值得立刻做的部分。

## 5. 表单与校验

建议沉淀：

- schema 校验
- 表单错误文案
- 提交态
- 重复提交保护

三端都会遇到，不值得每个页面各写一套。

## 6. 埋点与日志

建议至少预留：

- 页面曝光
- 按钮点击
- 请求失败
- 关键流程节点

先把事件接口定下来，哪怕先打 console/mock，也比后面到处补埋点强。

## 7. 列表分页与空态规范

三端业务一旦开始，列表页是高频场景。建议提早统一：

- 分页入参
- 空列表态
- 下拉刷新
- 加载更多
- 错误重试

## 8. 日期/数字/金额格式化

这应放在 i18n 基建里一并处理，而不是页面里直接 `toLocaleString()`。

---

## 九、推荐建设顺序

这里给的是适合当前项目的顺序，不是教科书顺序。

## Phase 1：先让共享层存在

1. 创建 `packages/types/src`
2. 创建 `packages/core/src`
3. 创建 `packages/api/src`
4. 修正 `package.json` 与 `exports`
5. 补齐 workspace 脚本契约

交付结果：

- monorepo 从空壳变成可承载基础设施的结构

## Phase 2：请求 + 存储 + 错误模型

1. `HttpAdapter`
2. `fetch` adapter
3. `Taro.request` adapter
4. `StorageAdapter`
5. `AppError` / 错误归一化
6. token provider

交付结果：

- 三端都能以统一方式请求接口和保存状态

## Phase 3：i18n + 主题

1. locale 类型
2. messages
3. 语言状态 store
4. theme token
5. theme state
6. 三端消费接入

交付结果：

- 三端具备统一的语言与主题基础能力

## Phase 4：hooks 体系

1. domain hooks
2. 异步状态 hook
3. 列表/分页 hooks
4. session hooks
5. 请求 hook 包装

交付结果：

- 后续业务页面有稳定的 hook 约定

## Phase 5：环境、埋点、表单、权限

1. env config
2. analytics interface
3. form schema
4. permission / capability guard

交付结果：

- 具备进入真实业务开发的工程下限

---

## 十、一个务实的落地口径

如果你问“现在先做什么最值”，答案不是同时开 10 个包，而是按这个顺序：

1. 先做 `packages/*/src` 和导出边界
2. 再做请求层、存储层、错误层
3. 再做 i18n 和主题
4. 最后做 hooks 规范化

原因很简单：

- hooks 依赖请求与状态
- i18n 与主题依赖存储与共享层
- 业务页依赖所有这些基础设施

如果顺序反了，后面会反复返工。

---

## 十一、不该做的事

### 1. 不要把 Expo 组件和 Taro 组件强行做成一套

这会让抽象层非常脆，最后两端都难受。

### 2. 不要把所有 hook 都放进共享层

平台 hook 和 UI hook 本来就不该共享。

### 3. 不要先引入一堆重量级库再想边界

当前仓库连共享包都还是空的，先建边界比先堆库更重要。

### 4. 不要等业务页面起来后再补 i18n / theme / storage

那时这些能力会反向渗透到每个页面，整改成本会很高。

---

## 十二、建议的首批产物

如果按当前项目实际情况启动，我建议第一批直接落地以下内容：

### 共享层

- `@repo/types/src/index.ts`
- `@repo/types/src/api.ts`
- `@repo/types/src/i18n.ts`
- `@repo/types/src/theme.ts`

- `@repo/core/src/i18n/index.ts`
- `@repo/core/src/theme/index.ts`
- `@repo/core/src/store/index.ts`
- `@repo/core/src/hooks/use-locale-state.ts`
- `@repo/core/src/hooks/use-theme-state.ts`

- `@repo/api/src/client/create-api-client.ts`
- `@repo/api/src/adapters/fetch-adapter.ts`
- `@repo/api/src/adapters/taro-request-adapter.ts`
- `@repo/api/src/errors/api-error.ts`
- `@repo/api/src/auth/token-provider.ts`

### app 接入层

- `apps/mobile/src/lib/api-client.ts`
- `apps/mobile/src/lib/storage.ts`
- `apps/mobile/src/lib/theme.ts`
- `apps/mobile/src/lib/i18n.ts`

- `apps/miniapp/src/lib/api-client.ts`
- `apps/miniapp/src/lib/storage.ts`
- `apps/miniapp/src/lib/theme.ts`
- `apps/miniapp/src/lib/i18n.ts`

这些不是最终形态，但足够让这个仓库从“模板项目”跨到“可承载业务的三端基建项目”。
