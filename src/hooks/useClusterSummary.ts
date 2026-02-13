import { useQuery } from '@tanstack/react-query';
import { fetchClusterSummary } from '../api/sparkApi';
import { POLL_CLUSTER_SUMMARY } from '../constants';
import type { ISparkMasterSummary } from '../types';

/**
 * Polls Spark Master /json/ every 30s.
 * Visibility-aware: only active when sidebar is visible.
 */
export function useClusterSummary(isVisible: boolean) {
  return useQuery<ISparkMasterSummary>({
    queryKey: ['spark-monitor', 'cluster'],
    queryFn: fetchClusterSummary,
    refetchInterval: POLL_CLUSTER_SUMMARY,
    enabled: isVisible
  });
}
