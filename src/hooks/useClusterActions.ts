import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCluster, deleteCluster } from '../api/sparkApi';
import type { ISparkClusterConfig } from '../types';

export function useStartCluster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config?: ISparkClusterConfig) => createCluster(config),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['spark-monitor'] })
  });
}

export function useStopCluster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteCluster(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['spark-monitor'] })
  });
}
