import type { ClientPlatform, FeedbackPort } from '@repo/types';
import type { TranslateFn } from '@repo/types/i18n';
import { createMutationContext, type MutationContext } from '../shared/mutation';

export interface OrganizationDraft {
  searchText: string;
  deptName: string;
  memberName: string;
}

export interface OrganizationActionResult {
  ok: boolean;
  mutation?: MutationContext;
}

export function createInitialOrganizationDraft(): OrganizationDraft {
  return {
    searchText: '',
    deptName: '',
    memberName: '',
  };
}

async function notifyValidationError(
  feedback: FeedbackPort,
  t: TranslateFn,
  key: string,
): Promise<OrganizationActionResult> {
  const message = t(key);
  await feedback.error(message, message);
  return { ok: false };
}

export async function searchOrganizationAction(options: {
  platform: ClientPlatform;
  feedback: FeedbackPort;
  t: TranslateFn;
  searchText: string;
}): Promise<OrganizationActionResult> {
  const value = options.searchText.trim();
  if (!value) {
    return notifyValidationError(options.feedback, options.t, 'validation.searchRequired');
  }

  const mutation = createMutationContext(options.platform, 'org-search');
  await options.feedback.toast(`${options.t('common.search')}: ${value}`);
  return { ok: true, mutation };
}

export async function addDepartmentAction(options: {
  platform: ClientPlatform;
  feedback: FeedbackPort;
  t: TranslateFn;
  deptName: string;
}): Promise<OrganizationActionResult> {
  const value = options.deptName.trim();
  if (!value) {
    return notifyValidationError(options.feedback, options.t, 'validation.departmentNameRequired');
  }

  const mutation = createMutationContext(options.platform, 'org-add-department');
  await options.feedback.toast(`${options.t('org.addDepartment')}: ${value}`, { kind: 'success' });
  return { ok: true, mutation };
}

export async function addMemberAction(options: {
  platform: ClientPlatform;
  feedback: FeedbackPort;
  t: TranslateFn;
  memberName: string;
}): Promise<OrganizationActionResult> {
  const value = options.memberName.trim();
  if (!value) {
    return notifyValidationError(options.feedback, options.t, 'validation.memberNameRequired');
  }

  const mutation = createMutationContext(options.platform, 'org-add-member');
  await options.feedback.toast(`${options.t('org.addMember')}: ${value}`, { kind: 'success' });
  return { ok: true, mutation };
}
