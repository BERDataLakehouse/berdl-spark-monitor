import { useEffect } from 'react';
import { useClusterStatus } from '../hooks/useClusterStatus';
import type { ISparkClusterStatus } from '../types';

export type BadgeColor = 'green' | 'amber' | 'red' | 'muted';

export function deriveBadge(
  data: ISparkClusterStatus | undefined,
  isLoading: boolean,
  isError: boolean
): BadgeColor {
  if (isLoading || isError || !data) {
    return 'muted';
  }
  if (data.error) {
    return 'red';
  }
  if (!data.master.exists) {
    return 'muted';
  }
  if (data.master.is_ready && data.workers.is_ready) {
    return 'green';
  }
  return 'amber';
}

/**
 * Polls cluster status and sets a data-spark-status attribute on the
 * sidebar tab element, driving the CSS badge dot.
 */
export function useTabBadge(panelId: string): void {
  const { data, isLoading, isError } = useClusterStatus();
  const badge = deriveBadge(data, isLoading, isError);

  useEffect(() => {
    const tab = document.querySelector(
      `li.lm-TabBar-tab[data-id="${panelId}"]`
    );
    if (tab) {
      tab.setAttribute('data-spark-status', badge);
    }
  }, [panelId, badge]);
}
