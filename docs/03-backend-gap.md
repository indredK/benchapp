# 后端缺口与前置设计建议

当前仓库没有真实后端实现，`packages/api` 仍是空包。因此，这里不是传统意义上的“后端代码审计”，而是针对未来高并发和生产接入的前置风险文档。

---

## 1. 后端能力尚未落地，所有并发与安全约束都还未定义

### 风险点 (Risk)

当前没有实际服务端代码，也没有请求上下文、错误模型、认证边界、幂等策略定义。换句话说：

- 并发原子性未定义
- 容错策略未定义
- 数据库锁策略未定义
- 连接池风险不可评估
- 安全约束未定义

属性：`[后端]`

### 严重性 (Severity)

`High`

### 深度重构 (Refactor)

建议先定义 `@repo/api` 的最小边界，而不是等接上数据库后再回头补：

```ts
export interface RequestContext {
  requestId: string;
  locale: 'zh-CN' | 'en-US';
  userId?: string;
}

export interface AppErrorShape {
  code: string;
  message: string;
  retryable: boolean;
}

export interface ApiClientOptions {
  timeoutMs: number;
  retryTimes: number;
}
```

```ts
export async function withRequestContext<T>(
  req: Request,
  handler: (ctx: RequestContext) => Promise<T>,
) {
  const ctx: RequestContext = {
    requestId: crypto.randomUUID(),
    locale: resolveLocale(req.headers.get('accept-language')),
    userId: await authenticate(req),
  };

  return handler(ctx);
}
```

### 设计理念 (Philosophy)

并发问题不是从数据库开始的，而是从“请求进入系统时有没有上下文和约束”开始的。先把请求边界定义清楚，后续才有资格谈事务、幂等和锁策略。

---

## 2. 未来涉及数据写入时，必须默认按并发冲突建模

### 风险点 (Risk)

如果未来把“读 -> 改 -> 写”直接写进接口而没有事务或幂等控制，任何秒级并发都会暴露竞态问题。

属性：`[后端]`

### 严重性 (Severity)

`High`

### 深度重构 (Refactor)

```ts
// 伪代码：未来所有关键写操作必须至少具备以下保护之一
await db.transaction(async (tx) => {
  const current = await tx.order.findUnique({ where: { id } });

  if (!current) {
    throw new AppError('ORDER_NOT_FOUND');
  }

  if (current.version !== input.version) {
    throw new AppError('VERSION_CONFLICT');
  }

  await tx.order.update({
    where: { id, version: input.version },
    data: {
      status: input.status,
      version: { increment: 1 },
    },
  });
});
```

### 设计理念 (Philosophy)

并发安全依赖显式冲突模型，而不是“默认不会同时点两次”。引入版本号、事务和幂等键，才能从结构上避免并发冲突。

---

## 3. 连接池与超时策略应该在 API 层统一，而不是散落在业务代码

### 风险点 (Risk)

未来如果每个接口各自处理超时、重试、连接配置，系统会在流量上来后暴露出连接堆积、重试风暴和级联失败。

属性：`[后端]`

### 严重性 (Severity)

`Medium`

### 深度重构 (Refactor)

```ts
export interface RetryPolicy {
  maxRetries: number;
  timeoutMs: number;
  backoffMs: number;
}

export function createApiClient(policy: RetryPolicy) {
  return {
    async request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
      return withTimeoutAndRetry(input, init, policy);
    },
  };
}
```

### 设计理念 (Philosophy)

连接池、超时和重试是系统级策略，不应该交给业务层临场发挥。统一治理比局部补丁更能防止高并发下的放大故障。

---

## 4. 安全约束必须先于业务接口定义

### 风险点 (Risk)

当前仓库还没有统一的认证、授权、输入校验和错误暴露策略。如果直接接业务接口，最先失控的通常不是功能，而是边界。

属性：`[后端]`

### 严重性 (Severity)

`High`

### 深度重构 (Refactor)

```ts
export interface AuthenticatedRequestContext extends RequestContext {
  userId: string;
  roles: string[];
}

export function assertRole(ctx: AuthenticatedRequestContext, role: string) {
  if (!ctx.roles.includes(role)) {
    throw new AppError('FORBIDDEN');
  }
}
```

### 设计理念 (Philosophy)

安全性不是“上线前补中间件”，而是系统边界设计的一部分。把认证、授权、输入约束放到最前面，才能避免后续在每个接口里散装补洞。

---

## 后端启动前建议清单

在真正开始写服务端代码前，建议先完成以下事项：

1. 定义统一 `RequestContext`
2. 定义统一 `AppError` / 错误码
3. 定义认证与授权接口
4. 定义重试、超时、日志、requestId 传播策略
5. 约定关键写操作的事务、版本号或幂等键方案

这五项不做，后端代码越写越快，后面返工越重。
