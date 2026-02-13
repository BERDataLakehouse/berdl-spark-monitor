import { useQuery } from '@tanstack/react-query';
import { fetchExecutors } from '../api/sparkApi';
import { POLL_EXECUTORS_ACTIVE, POLL_EXECUTORS_IDLE } from '../constants';
import type { IExecutorSummary } from '../types';

/**
 * Polls executor stats with adaptive interval.
 * - 10s when any executor has activeTasks > 0
 * - 30s otherwise
 * Visibility-aware: only active when sidebar is visible.
 */
export function useExecutors(isVisible: boolean) {
  return useQuery<IExecutorSummary[]>({
    queryKey: ['spark-monitor', 'executors'],
    queryFn: fetchExecutors,
    enabled: isVisible,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && data.some(e => e.activeTasks > 0)) {
        return POLL_EXECUTORS_ACTIVE;
      }
      return POLL_EXECUTORS_IDLE;
    }
  });
}
