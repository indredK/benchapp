// ============================================================
// @repo/api-mocks — 仅供本地开发 / 测试使用的 mock 数据与 adapter。
//
// ⚠️ 生产构建中，各端打包器会把整个 `@repo/api-mocks` 包 alias 成
//    `./stub`（见各 app 的 vite / metro / taro 配置），因此这里导出的
//    任何 mock 数据都不会进入生产产物。
// ============================================================

export { createMockAdapter } from './mock-adapter';
export type { MockHandler, MockConfig, MockContext } from './mock-adapter';
export { mockHandlers } from './handlers';
export { mockUsers, mockLoginResponse } from './data/users';
export { mockDepartments, mockMembers, searchOrg } from './data/org';
export type { OrgDepartment, OrgMember } from './data/org';
