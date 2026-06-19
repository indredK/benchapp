// Common contracts (health check, ping, etc.)
import type { ApiClient } from '../client/create-api-client';

export function healthCheck(client: ApiClient): Promise<{ status: string }> {
  return client.get<{ status: string }>('/health');
}
