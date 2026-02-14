import React from 'react';
import { useClusterSummary } from '../hooks/useClusterSummary';
import { useSparkVisibility } from '../contexts/SparkVisibilityContext';
import { ResourceBar } from './ResourceBar';
import { formatBytes } from '../utils/format';

export const ClusterOverview: React.FC = () => {
  const isVisible = useSparkVisibility();
  const { data, isLoading, isError } = useClusterSummary(isVisible);

  if (isLoading || !data) {
    if (isError) {
      return (
        <div className="spark-monitor-overview">
          Unable to reach Spark Master
        </div>
      );
    }
    return (
      <div className="spark-monitor-overview">Loading cluster info...</div>
    );
  }

  return (
    <div className="spark-monitor-overview">
      <div className="spark-monitor-overview-workers">
        Workers: {data.aliveworkers}
      </div>
      <ResourceBar label="Cores" used={data.coresused} total={data.cores} />
      <ResourceBar
        label="Memory"
        used={data.memoryused}
        total={data.memory}
        formatValue={formatBytes}
      />
    </div>
  );
};
