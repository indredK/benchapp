# 开发规范文档

## 项目结构

```
my-workspace/
├── apps/                    # 应用层
│   ├── web/                 # Web 应用 (Vite + React 19)
│   ├── mobile/              # 移动端应用 (Expo SDK 56 + React Native)
│   └── miniapp/             # 小程序应用 (Taro 4.2 + Vite)
├── packages/                # 共享包
│   ├── api/                 # API 核心（适配器、客户端）
│   ├── api-mocks/           # Mock 数据与处理器
│   ├── core/                # 核心工具
│   ├── features/            # 功能模块
│   └── types/               # 类型定义
├── scripts/                 # 工具脚本
│   ├── start.mjs            # 统一启动入口
│   ├── build.mjs            # 统一打包 + Mock 泄漏检测
│   └── typecheck-staged.mjs # 提交前按项目分组类型检查
└── docs/                    # 文档
```

---

## 一、启动方式

### 交互式启动（推荐）

```bash
pnpm start
```

依次选择：**应用包 → 脚本命令 → 数据模式 → 确认启动**

### 快捷启动

```bash
pnpm dev:web        # Web 开发模式
pnpm dev:mobile     # Mobile 开发模式
pnpm dev:miniapp    # 小程序开发模式
```

### 直接指定

```bash
node ./scripts/start.mjs <appName> <scriptName>
# 例如：node ./scripts/start.mjs web dev
```

---

## 二、数据模式

项目支持两种数据模式，由 `scripts/start.mjs` 交互式选择：

| 模式                | 说明                   | 数据来源                       |
| ------------------- | ---------------------- | ------------------------------ |
| 📦 模拟数据（Mock） | 本地模拟接口，无需后端 | `packages/api-mocks/src/data/` |
| 🔗 联调真实接口     | 请求真实后端服务       | 配置的 API 地址                |

### 生产安全保障

- 生产构建时，打包器将 `@repo/api-mocks` 替换为 `stub.ts`（空实现）
- `.env` 文件默认 `VITE_ENABLE_MOCK=false`
- 误调 mock adapter 时会立即抛出明确错误

---

## 三、环境配置

### 3.1 Web (`apps/web`)

环境变量通过 `.env.*` 文件配置，Vite 编译时注入到 `import.meta.env`。

| 文件               | 生效场景                 | 关键变量                                           |
| ------------------ | ------------------------ | -------------------------------------------------- |
| `.env`             | 所有环境通用             | `VITE_ENABLE_MOCK=false`, `VITE_API_BASE_URL=/api` |
| `.env.development` | `pnpm dev`               | `VITE_ENABLE_MOCK=true`, `VITE_API_BASE_URL=/api`  |
| `.env.test`        | `vite build --mode test` | `VITE_API_BASE_URL=https://test-api.example.com`   |
| `.env.production`  | `pnpm build`             | `VITE_API_BASE_URL=https://api.example.com`        |
| `.env.example`     | 模板文件                 | 提示复制为 `.env.local`                            |

**使用方式：**

```ts
// apps/web/src/lib/api-client.ts
const enableMock = import.meta.env.VITE_ENABLE_MOCK === 'true';
const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api';
```

### 3.2 Mobile (`apps/mobile`)

配置在 `apps/mobile/src/config/env.ts`，根据 `NODE_ENV` 选择环境。运行时可通过 `start.mjs` 注入的环境变量覆盖：

| NODE_ENV      | baseURL                            |
| ------------- | ---------------------------------- |
| `development` | `http://localhost:3000/api`        |
| `test`        | `https://test-api.example.com/api` |
| `production`  | `https://api.example.com/api`      |

**环境变量覆盖：**

| 变量                            | 作用          |
| ------------------------------- | ------------- |
| `EXPO_PUBLIC_ENABLE_MOCK=false` | 强制关闭 mock |
| `API_BASE_URL=xxx`              | 覆盖接口地址  |

### 3.3 MiniApp (`apps/miniapp`)

配置在 `apps/miniapp/src/config/env.ts`，与 Mobile 相同的三套硬编码配置。通过 Taro 的 `defineConstants` 编译时注入：

| 编译时常量              | 来源环境变量           |
| ----------------------- | ---------------------- |
| `__TARO_ENABLE_MOCK__`  | `TARO_APP_ENABLE_MOCK` |
| `__TARO_API_BASE_URL__` | `API_BASE_URL`         |

---

## 四、Mock 数据开发

所有 mock 数据集中在 `packages/api-mocks/`：

```
packages/api-mocks/src/
├── data/
│   ├── users.ts          # 3 个 mock 用户 + 登录响应数据
│   └── org.ts            # 部门树（3层深度）+ 47 个成员 + 搜索函数
├── handlers.ts           # 13 个 API 路由处理器
├── mock-adapter.ts       # Mock 适配器（拦截请求、模拟延迟 200-400ms）
├── index.ts              # 统一导出入口
└── stub.ts               # 生产替身（防止误用）
```

### 已有 Mock API 路由

| 方法 | 路径                       | 说明                                   |
| ---- | -------------------------- | -------------------------------------- |
| POST | `/auth/login`              | 登录                                   |
| POST | `/auth/miniapp/login`      | 小程序登录                             |
| POST | `/auth/miniapp/bind-phone` | 绑定手机号                             |
| GET  | `/api/users`               | 用户列表（分页）                       |
| GET  | `/api/users/:id`           | 用户详情                               |
| GET  | `/api/org/departments`     | 部门列表                               |
| GET  | `/api/org/departments/:id` | 部门详情                               |
| GET  | `/api/org/members`         | 成员列表（支持 `?departmentId=` 过滤） |
| GET  | `/api/org/members/:id`     | 成员详情                               |
| GET  | `/api/org/search`          | 组织搜索（`?keyword=`）                |
| POST | `/api/org/departments`     | 创建部门（201）                        |
| POST | `/api/org/members`         | 创建成员（201）                        |
| POST | `/api/form/submit`         | 表单提交                               |

### 添加新 Mock 接口

1. 在 `packages/api-mocks/src/data/` 添加数据文件
2. 在 `packages/api-mocks/src/handlers.ts` 注册路由处理器
3. 在 `packages/api-mocks/src/index.ts` 导出新数据

---

## 五、各环境对应配置速查

| 场景                  | 启动方式                               | Mock/真实 | API 地址                       |
| --------------------- | -------------------------------------- | --------- | ------------------------------ |
| 本地开发 (Mock)       | `pnpm start` → 📦 模拟数据             | Mock      | 不请求                         |
| 本地开发 (联调)       | `pnpm start` → 🔗 联调真实接口         | 真实      | `localhost:3000/api`           |
| 本地开发 (自定义接口) | `pnpm start` → 🔗 联调接口(自定义地址) | 真实      | 手动输入                       |
| 测试环境构建          | 各平台 `build` 命令 + `--mode test`    | 真实      | `https://test-api.example.com` |
| 生产构建              | 各平台 `build` 命令                    | 真实      | `https://api.example.com`      |

---

## 六、常见开发操作

| 操作                    | 涉及文件                                                               |
| ----------------------- | ---------------------------------------------------------------------- |
| 添加/修改 mock 数据     | `packages/api-mocks/src/data/*.ts`                                     |
| 添加/修改 mock 接口     | `packages/api-mocks/src/handlers.ts`                                   |
| 修改 Web 环境变量默认值 | `apps/web/.env` / `.env.development` / `.env.production` / `.env.test` |
| 修改 Mobile 环境地址    | `apps/mobile/src/config/env.ts`                                        |
| 修改 MiniApp 环境地址   | `apps/miniapp/src/config/env.ts`                                       |
| 调整联调 API 地址       | 通过 `pnpm start` 交互选择即可                                         |
| 添加跨平台共享类型      | `packages/types/src/`                                                  |
| 修改 MiniApp 编译配置   | `apps/miniapp/config/index.ts`                                         |

---

## 七、生产构建

### 7.1 交互式构建（推荐）

```bash
pnpm build
```

依次选择：**应用平台 → 子平台（如小程序选微信/iOS/Android）→ 确认 → 构建 → Mock 泄漏自动检测**

### 7.2 快捷构建

```bash
pnpm build:web              # 仅 Web
pnpm build:miniapp          # 仅小程序（微信）
pnpm build:app:android      # 仅 Android（EAS 云端）
pnpm build:app:ios          # 仅 iOS（EAS 云端）
pnpm build:app:android:local # 仅 Android（本地）
pnpm build:app:ios:local    # 仅 iOS（本地，需 Xcode 手动 Archive）
```

### 7.3 构建流程

```
选择应用 → 确认目标 → 执行构建 → 自动扫描产物中 Mock 敏感标识符 → 输出报告
```

构建结束后会自动检查以下标识符是否泄漏到产物：

| 搜索标识符                                    | 来源                                   |
| --------------------------------------------- | -------------------------------------- |
| `mockUsers`                                   | `packages/api-mocks/src/data/users.ts` |
| `mockDepartments`, `mockMembers`, `searchOrg` | `packages/api-mocks/src/data/org.ts`   |
| `mockLoginResponse`                           | `packages/api-mocks/src/data/users.ts` |
| `mockHandlers`                                | `packages/api-mocks/src/handlers.ts`   |

---

## 八、Mock 不进生产包的防护设计

### 双层防护机制

| 防线                     | Web                              | Mobile                             | MiniApp                      |
| ------------------------ | -------------------------------- | ---------------------------------- | ---------------------------- |
| **第一层：构建时 alias** | Vite `resolve.alias` → `stub.ts` | Metro `resolveRequest` → `stub.ts` | Taro `alias` → `stub.ts`     |
| **第二层：运行时守卫**   | `VITE_ENABLE_MOCK=false`         | `env.ts` `enableMock: false`       | `env.ts` `enableMock: false` |

### stub.ts 设计

生产构建时整个 `@repo/api-mocks` 被替换为仅含一个 `throw Error` 函数的文件，mock 数据零字节进入产物。

### 验证方法

```bash
# Web
grep -r "mockUsers\|mockDepartments\|mockMembers\|searchOrg" apps/web/dist/

# 小程序
grep -r "mockUsers\|mockDepartments\|mockMembers\|searchOrg" apps/miniapp/dist/

# 应返回空，表示 mock 数据未进包
```

---

## 九、提交前检查

项目使用 Husky + lint-staged + commitlint 三层卡控：

### 9.1 lint-staged 配置

```
*.{ts,tsx} → prettier --write → node scripts/typecheck-staged.mjs
*.{js,mjs,json,md,scss,css,yaml,yml} → prettier --write
```

### 9.2 类型检查机制

`typecheck-staged.mjs` 自动扫 `apps/` 和 `packages/` 下所有含 `tsconfig.json` 的子目录，根据变更文件路径分组，逐项目运行 `tsc -p <tsconfig.json> --noEmit`。

**为什么不从根目录跑 tsc？**

monorepo 中每个 app 有独立的 tsconfig（路径别名、JSX 模式、专属声明互不相同），根级合并会导致冲突。例如 MiniApp 的 `@/*` 映射到 `apps/miniapp/src/*`，Mobile 的 `@/*` 映射到 `apps/mobile/src/*`，根目录只能定义一个。

### 9.3 commitlint

提交信息需遵循 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```bash
feat: 添加用户登录功能
fix: 修复首页加载白屏
chore: 升级依赖版本
docs: 更新开发文档
```

---

## 十、Mobile App 打包优化

### 10.1 构建方式对比

| 方式             | 命令                               | 适用场景              |
| ---------------- | ---------------------------------- | --------------------- |
| **EAS 云端**     | `eas build --platform ios/android` | 正式发版              |
| **本地 Android** | `pnpm build:app:android:local`     | 快速测试              |
| **本地 iOS**     | `pnpm build:app:ios:local`         | 需 Xcode 手动 Archive |

### 10.2 Android APK 体积优化

**默认通用包 ~102MB，优化后 arm64 ~30MB。**

已配置的优化：

| 优化项                           | 配置位置                                           | 效果              |
| -------------------------------- | -------------------------------------------------- | ----------------- |
| ABI 拆分（只出 arm64 + armeabi） | `apps/mobile/plugins/withAndroidSplits.js`         | 每个 CPU 一个 APK |
| ProGuard 代码压缩                | `app.json` → `enableProguardInReleaseBuilds: true` | 砍 ~15MB          |
| Hermes JS 引擎                   | Expo SDK 56 默认                                   | 砍 ~10MB          |

产物位置：

```
apps/mobile/android/app/build/outputs/apk/release/
├── app-arm64-v8a-release.apk    # 主流手机用这个
└── app-armeabi-v7a-release.apk  # 旧手机
```

### 10.3 iOS 优化

iOS 天生单架构（arm64），App Store 自动 App Thinning，无需额外优化。

---

## 十一、OTA 热更新

### 11.1 配置

使用 `expo-updates`，已集成在 `apps/mobile/app.json`：

```json
{
  "plugins": ["expo-updates"],
  "updates": {
    "url": "https://u.expo.dev/<project-id>",
    "enabled": true,
    "fallbackToCacheTimeout": 0
  },
  "runtimeVersion": { "policy": "appVersion" }
}
```

### 11.2 首次接入

```bash
cd apps/mobile
npx eas login
npx eas init    # 获取 Project ID，替换 app.json 中的 REPLACE_WITH_YOUR_PROJECT_ID
```

### 11.3 日常发布

| 场景       | 命令                                               | 效果                        |
| ---------- | -------------------------------------------------- | --------------------------- |
| 纯 JS 改动 | `eas update --channel production --message "描述"` | 用户打开 App 数秒内自动更新 |
| 原生改动   | `eas build --platform ios --profile production`    | 走商店审核，用户需手动更新  |
| 开发调试   | `eas update --channel preview`                     | 仅测试设备接收              |

> OTA 更新不消耗 EAS 构建额度，比重新编译快上百倍。
