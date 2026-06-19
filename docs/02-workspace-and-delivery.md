# Workspace 与交付链专项审计

本文聚焦以下问题：

- monorepo 结构是否真实可用
- 类型边界是否可信
- build / lint / typecheck 是否能作为交付门禁
- 配置是否会在多环境下漂移

---

## 1. 路径映射与目录结构不一致，形成空壳共享层

### 风险点 (Risk)

`tsconfig.base.json` 把 `@repo/core`、`@repo/api`、`@repo/types` 映射到 `packages/*/src`，但实际 `packages/*` 下没有 `src` 目录，只有 `package.json`。同时两个 app 已经声明依赖这些包。

属性：`[前端/工程]`

### 严重性 (Severity)

`High`

### 深度重构 (Refactor)

```text
packages/
  core/
    package.json
    src/
      index.ts
      i18n.ts
  types/
    package.json
    src/
      index.ts
      i18n.ts
  api/
    package.json
    src/
      index.ts
      http/
```

```json
{
  "name": "@repo/core",
  "version": "1.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

### 设计理念 (Philosophy)

架构分层不能只体现在目录名上。共享层如果不存在，业务代码会自然回流到页面和应用内部，之后再想抽公共能力，成本会成倍增加。

---

## 2. 根构建脚本和子包脚本契约不统一

### 风险点 (Risk)

根 `package.json` 定义了 `build: pnpm -r build`，但子包并未形成统一的 `build` / `typecheck` / `lint` 协议，这会让 workspace 级命令失去稳定语义。

属性：`[前端/工程]`

### 严重性 (Severity)

`High`

### 深度重构 (Refactor)

```json
{
  "scripts": {
    "build": "pnpm --recursive --if-present run build",
    "typecheck": "pnpm --recursive --if-present run typecheck",
    "lint": "pnpm --recursive --if-present run lint",
    "verify": "pnpm run lint && pnpm run typecheck && pnpm run build"
  }
}
```

```json
{
  "scripts": {
    "build": "expo export --platform web",
    "typecheck": "tsc --noEmit",
    "lint": "expo lint"
  }
}
```

### 设计理念 (Philosophy)

交付门禁依赖脚本契约统一。没有统一约定，CI 即使跑了命令，也无法证明“每个包都被真实检查过”。

---

## 3. 实际检查链已被工具签名校验阻断

### 风险点 (Risk)

本次审计中，执行 `pnpm -r build` 与 `pnpm --filter mobile lint` 时，`pnpm@10.25.0` 的 registry signature 校验失败，导致无法完成可信验证。

属性：`[前端/工程]`

### 严重性 (Severity)

`High`

### 深度重构 (Refactor)

建议补三项治理：

```text
1. 固定团队使用的 pnpm 安装来源与版本策略
2. 明确 CI 中的包管理器准备步骤
3. 将 verify 作为唯一对外门禁命令
```

```yaml
# 示例：CI 只暴露一个验证入口
steps:
  - install package manager
  - install dependencies
  - run: pnpm run verify
```

### 设计理念 (Philosophy)

如果构建工具本身不稳定，代码审计结论就无法被持续验证。工程链不可信，本质上也是生产风险。

---

## 4. Taro 配置分支依赖 `NODE_ENV`，存在环境漂移风险

### 风险点 (Risk)

`apps/miniapp/config/index.ts` 在 `defineConfig` 回调里已经拿到了 `command` / `mode`，却仍依赖 `process.env.NODE_ENV` 判断 dev/prod。多环境构建时容易出现错误分支。

属性：`[前端/工程]`

### 严重性 (Severity)

`Medium`

### 深度重构 (Refactor)

```ts
export default defineConfig<'vite'>((merge, { command, mode }) => {
  const isDev = command === 'build' ? mode === 'development' : true;
  return merge({}, baseConfig, isDev ? devConfig : prodConfig);
});
```

### 设计理念 (Philosophy)

构建配置应以构建器传入上下文为准，而不是依赖外部环境变量碰巧正确。这样才能避免预发、灰度、CI 本地构建结果不一致。

---

## 5. 当前共享层应优先承载的内容

### 风险点 (Risk)

如果不尽快定义共享层职责，未来代码会继续散落在 `apps/mobile` 和 `apps/miniapp` 内部。

属性：`[前端/工程]`

### 严重性 (Severity)

`Medium`

### 深度重构 (Refactor)

建议职责切分如下：

```text
@repo/types
- DTO
- locale message 类型
- 组件公共 props 类型

@repo/core
- i18n
- 常量
- 纯函数
- 平台无关的 domain 逻辑

@repo/api
- 请求客户端
- 错误模型
- 鉴权头拼装
- 重试/超时策略
```

### 设计理念 (Philosophy)

共享层的价值不在“抽代码”，而在“定义边界”。边界一旦清晰，前端扩展、后端接入、测试策略和多端复用都会更稳定。
