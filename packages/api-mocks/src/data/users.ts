import type { UserProfileDTO, LoginResponse } from '@repo/types/api';

export const mockUsers: UserProfileDTO[] = [
  {
    id: 'u1',
    nickname: '张三',
    avatar: 'https://i.pravatar.cc/150?u=1',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'u2',
    nickname: '李四',
    avatar: 'https://i.pravatar.cc/150?u=2',
    email: 'lisi@example.com',
    phone: '13800138002',
    createdAt: '2024-03-20T10:30:00Z',
  },
  {
    id: 'u3',
    nickname: '王五',
    avatar: 'https://i.pravatar.cc/150?u=3',
    email: 'wangwu@example.com',
    phone: '13800138003',
    createdAt: '2024-06-01T14:00:00Z',
  },
];

export const mockLoginResponse: LoginResponse = {
  accessToken: 'mock_token_abc123',
  refreshToken: 'mock_refresh_xyz789',
  expiresIn: 7200,
  user: mockUsers[0],
};
