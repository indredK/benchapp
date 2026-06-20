// ============================================================
// Mock route handlers — 所有 mock 接口定义
// 每个 handler: { method, pattern, response }
// response 工厂接收 { params, query, body } 上下文
// ============================================================

import type { MockHandler, MockContext } from './mock-adapter';
import { mockUsers, mockLoginResponse } from './data/users';
import { mockDepartments, mockMembers, searchOrg } from './data/org';
import type { OrgDepartment, OrgMember } from './data/org';

export const mockHandlers: MockHandler[] = [
  // --- Auth ---
  {
    method: 'POST',
    pattern: '/auth/login',
    response: () => mockLoginResponse,
  },
  {
    method: 'POST',
    pattern: '/auth/miniapp/login',
    response: () => mockLoginResponse,
  },
  {
    method: 'POST',
    pattern: '/auth/miniapp/bind-phone',
    response: () => mockLoginResponse,
  },

  // --- Users ---
  {
    method: 'GET',
    pattern: '/api/users',
    response: () => ({
      list: mockUsers,
      total: mockUsers.length,
      page: 1,
      pageSize: 20,
      hasMore: false,
    }),
  },
  {
    method: 'GET',
    pattern: '/api/users/:id',
    response: ({ params }: MockContext) => {
      const user = mockUsers.find((u) => u.id === params.id);
      if (!user) return { code: 404, message: 'User not found' };
      return user;
    },
  },

  // --- Organization ---
  {
    method: 'GET',
    pattern: '/api/org/departments',
    response: () => mockDepartments,
  },
  {
    method: 'GET',
    pattern: '/api/org/departments/:id',
    response: ({ params }: MockContext) => {
      const dept = mockDepartments.find((d) => d.id === params.id);
      if (!dept) return { code: 404, message: 'Department not found' };
      return dept;
    },
  },
  {
    method: 'GET',
    pattern: '/api/org/members',
    response: ({ query }: MockContext) => {
      const deptId = query.departmentId;
      if (deptId) return mockMembers.filter((m) => m.departmentId === deptId);
      return mockMembers;
    },
  },
  {
    method: 'GET',
    pattern: '/api/org/members/:id',
    response: ({ params }: MockContext) => {
      const member = mockMembers.find((m) => m.id === params.id);
      if (!member) return { code: 404, message: 'Member not found' };
      return member;
    },
  },
  {
    method: 'GET',
    pattern: '/api/org/search',
    response: ({ query }: MockContext) => searchOrg(query.keyword ?? ''),
  },
  {
    method: 'POST',
    pattern: '/api/org/departments',
    response: ({ body }: MockContext) => {
      const b = body as { name: string };
      const newDept: OrgDepartment = {
        id: `d${Date.now()}`,
        name: b.name,
        parentId: null,
        memberCount: 0,
      };
      mockDepartments.push(newDept);
      return newDept;
    },
    statusCode: 201,
  },
  {
    method: 'POST',
    pattern: '/api/org/members',
    response: ({ body }: MockContext) => {
      const b = body as { name: string; departmentId: string; role: string };
      const newMember: OrgMember = {
        id: `m${Date.now()}`,
        name: b.name,
        departmentId: b.departmentId,
        role: b.role ?? '成员',
        avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
      };
      mockMembers.push(newMember);
      return newMember;
    },
    statusCode: 201,
  },

  // --- Contact Form ---
  {
    method: 'POST',
    pattern: '/api/form/submit',
    response: () => ({ success: true, message: '提交成功' }),
  },
];
