import { useCallback, useMemo, useState } from 'react';
import type { ClientPlatform, FeedbackPort } from '@repo/types';
import type { TranslateFn } from '@repo/types/i18n';
import {
  addDepartmentAction,
  addMemberAction,
  createInitialOrganizationDraft,
  searchOrganizationAction,
  type OrganizationDraft,
} from './model';
import { createSingleFlightExecutor } from '../shared/mutation';

type ActionKey = 'search' | 'department' | 'member';

export function useOrganizationController(options: {
  platform: ClientPlatform;
  feedback: FeedbackPort;
  t: TranslateFn;
}) {
  const { platform, feedback, t } = options;
  const [draft, setDraft] = useState<OrganizationDraft>(createInitialOrganizationDraft);
  const [pending, setPending] = useState<Record<ActionKey, boolean>>({
    search: false,
    department: false,
    member: false,
  });
  const executor = useMemo(() => createSingleFlightExecutor(), []);

  const runAction = useCallback(async <T,>(key: ActionKey, task: () => Promise<T>): Promise<T> => {
    setPending((current) => ({ ...current, [key]: true }));
    try {
      return await executor(key, task);
    } finally {
      setPending((current) => ({ ...current, [key]: false }));
    }
  }, [executor]);

  const setSearchText = useCallback((searchText: string) => {
    setDraft((current) => ({ ...current, searchText }));
  }, []);

  const setDeptName = useCallback((deptName: string) => {
    setDraft((current) => ({ ...current, deptName }));
  }, []);

  const setMemberName = useCallback((memberName: string) => {
    setDraft((current) => ({ ...current, memberName }));
  }, []);

  const handleSearch = useCallback(async () => {
    return runAction('search', async () => {
      const result = await searchOrganizationAction({
        platform,
        feedback,
        t,
        searchText: draft.searchText,
      });
      return result.ok;
    });
  }, [draft.searchText, feedback, platform, runAction, t]);

  const handleAddDepartment = useCallback(async () => {
    return runAction('department', async () => {
      const result = await addDepartmentAction({
        platform,
        feedback,
        t,
        deptName: draft.deptName,
      });

      if (result.ok) {
        setDraft((current) => ({ ...current, deptName: '' }));
      }

      return result.ok;
    });
  }, [draft.deptName, feedback, platform, runAction, t]);

  const handleAddMember = useCallback(async () => {
    return runAction('member', async () => {
      const result = await addMemberAction({
        platform,
        feedback,
        t,
        memberName: draft.memberName,
      });

      if (result.ok) {
        setDraft((current) => ({ ...current, memberName: '' }));
      }

      return result.ok;
    });
  }, [draft.memberName, feedback, platform, runAction, t]);

  return {
    draft,
    pending,
    setSearchText,
    setDeptName,
    setMemberName,
    handleSearch,
    handleAddDepartment,
    handleAddMember,
  };
}
