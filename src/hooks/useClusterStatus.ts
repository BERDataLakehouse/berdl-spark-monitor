import { useQuery } from '@tanstack/react-query';
import { fetchClusterStatus } from '../api/sparkApi';
import { POLL_STATUS } from '../constants';
import type { ISparkClusterStatus } from '../types';

/**
 * Polls cluster manager status every 30s.
 * Always active (not visibility-aware) — drives the ambient status bar.
 */
export function useClusterStatus() {
  return useQuery<ISparkClusterStatus>({
    queryKey: ['spark-monitor', 'status'],
    queryFn: fetchClusterStatus,
    refetchInterval: POLL_STATUS
  });
}
