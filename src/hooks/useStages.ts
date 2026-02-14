import { useQuery } from '@tanstack/react-query';
import { fetchStages } from '../api/sparkApi';
import { POLL_STAGES_ACTIVE, POLL_STAGES_IDLE } from '../constants';
import type { IStageSummary } from '../types';

/**
 * Polls stage data with adaptive interval.
 * - 5s when any stage is ACTIVE
 * - 30s otherwise
 * Visibility-aware: only active when sidebar is visible.
 *
 * Splits response into active and recent (last 20 completed/failed).
 */
export function useStages(isVisible: boolean) {
  const query = useQuery<IStageSummary[]>({
    queryKey: ['spark-monitor', 'stages'],
    queryFn: fetchStages,
    enabled: isVisible,
    refetchInterval: q => {
      const data = q.state.data;
      if (data && data.some(s => s.status === 'ACTIVE')) {
        return POLL_STAGES_ACTIVE;
      }
      return POLL_STAGES_IDLE;
    }
  });

  const stages = query.data ?? [];
  const active = stages.filter(s => s.status === 'ACTIVE');
  const recent = stages
    .filter(s => s.status === 'COMPLETE' || s.status === 'FAILED')
    .sort((a, b) => {
      const ta = a.completionTime ?? a.submissionTime ?? '';
      const tb = b.completionTime ?? b.submissionTime ?? '';
      return tb.localeCompare(ta);
    })
    .slice(0, 20);

  return { ...query, active, recent };
}
