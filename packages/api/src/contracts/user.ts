// ============================================================
// API contracts — user module example
// ============================================================

import type { ApiClient } from '../client/create-api-client';
import type { GetUserListParams, GetUserListResponse, LoginRequest, LoginResponse, UserProfileDTO } from '@repo/types/api';

export function getUserProfile(client: ApiClient): Promise<UserProfileDTO> {
  return client.get<UserProfileDTO>('/user/me');
}

export function login(client: ApiClient, params: LoginRequest): Promise<LoginResponse> {
  return client.post<LoginResponse>('/auth/login', params);
}

export function getUserList(client: ApiClient, params: GetUserListParams): Promise<GetUserListResponse> {
  return client.get<GetUserListResponse>('/users', { query: params as unknown as Record<string, string | number | boolean | undefined> });
}
