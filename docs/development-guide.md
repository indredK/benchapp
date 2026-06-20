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
│   └── start.mjs            # 统一启动入口
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
