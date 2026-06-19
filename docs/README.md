# 项目审计文档

这组文档整理了当前仓库的结构性风险、工程优化点和后续重构方向，结论基于当前代码状态而不是理想状态。

## 文档索引

- [00-overview.md](./00-overview.md): 总览、优先级与当前结论
- [01-frontend-review.md](./01-frontend-review.md): 前端 i18n、组件抽象、状态副作用、响应式与性能问题
- [02-workspace-and-delivery.md](./02-workspace-and-delivery.md): monorepo、构建链、类型边界与交付可靠性问题
- [03-backend-gap.md](./03-backend-gap.md): 后端缺口、并发与安全边界的前置设计建议
- [04-three-end-foundation-blueprint.md](./04-three-end-foundation-blueprint.md): 基于当前仓库的三端基础设施建设蓝图

## 当前判断

这个仓库还处在“可运行脚手架”阶段，不是“可防守生产系统”阶段。优先工作不是继续堆业务页面，而是先把以下三件事做实：

1. 让 workspace 共享层真正存在并可被类型系统约束。
2. 把前端文案、主题和跨端公共逻辑从页面组件里抽出来。
3. 让 lint / typecheck / build 成为可信的交付门禁。

## 验证补充

本次审计期间，`pnpm -r build` 与 `pnpm --filter mobile lint` 未完成有效校验，因为 `pnpm@10.25.0` 的 registry signature 校验失败，说明当前工程链本身还不稳定。
