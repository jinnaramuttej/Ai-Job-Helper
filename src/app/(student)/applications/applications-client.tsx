'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getStudentApplications, getCurrentUser } from '@/lib/api';
import type { StudentApplicationRow } from '@/lib/api';
import type { UIData } from '@/lib/view-models';
import { toUIApplication, createEmptyUIData } from '@/lib/view-models';
import { ApplicationsScreen } from '@/components/screens/Applications';

export function ApplicationsClient() {
  const [appRows, setAppRows] = useState<StudentApplicationRow[]>([]);
  const [state, setState] = useState<'ready' | 'loading' | 'empty' | 'error'>('loading');

  const loadData = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        setState('empty');
        return;
      }
      const apps = await getStudentApplications(user.id);
      setAppRows(apps);
      setState(apps.length === 0 ? 'empty' : 'ready');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((user) => {
        if (!user) {
          if (!cancelled) setState('empty');
          return;
        }
        return getStudentApplications(user.id).then((apps) => {
          if (cancelled) return;
          setAppRows(apps);
          setState(apps.length === 0 ? 'empty' : 'ready');
        });
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const uiData: UIData = useMemo(() => {
    const base = createEmptyUIData();
    const uiApps = appRows.map(({ application, job }) => toUIApplication(application, job));
    return {
      ...base,
      applications: uiApps,
    };
  }, [appRows]);

  return (
    <ApplicationsScreen
      data={uiData}
      state={state}
      onRetry={loadData}
    />
  );
}
