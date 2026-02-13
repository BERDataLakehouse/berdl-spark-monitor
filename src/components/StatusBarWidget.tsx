import React from 'react';
import { useClusterStatus } from '../hooks/useClusterStatus';
import type { ISparkClusterStatus } from '../types';

interface IProps {
  onClick: () => void;
}

type DotColor = 'green' | 'amber' | 'red' | 'muted';

function deriveState(data: ISparkClusterStatus | undefined, isLoading: boolean, isError: boolean): { label: string; dot: DotColor } {
  if (isLoading) {
    return { label: 'Spark: ...', dot: 'muted' };
  }
  if (isError || !data) {
    return { label: 'Spark', dot: 'muted' };
  }
  if (data.error) {
    return { label: 'Spark: Error', dot: 'red' };
  }
  if (!data.master.exists) {
    return { label: 'Spark: No Cluster', dot: 'muted' };
  }
  const ready = data.workers.ready_replicas ?? 0;
  const total = data.workers.replicas ?? 0;
  if (data.master.is_ready && data.workers.is_ready) {
    return { label: `Spark: Ready (${ready}/${total})`, dot: 'green' };
  }
  return { label: `Spark: Starting (${ready}/${total})`, dot: 'amber' };
}

export const StatusBarWidget: React.FC<IProps> = ({ onClick }) => {
  const { data, isLoading, isError } = useClusterStatus();
  const { label, dot } = deriveState(data, isLoading, isError);

  return (
    <button
      className="spark-monitor-statusbar"
      onClick={onClick}
      title="Open Spark Monitor"
    >
      <span className={`spark-monitor-dot spark-monitor-dot--${dot}`} />
      <span className="spark-monitor-statusbar-label">{label}</span>
    </button>
  );
};
