import React from 'react';
import { useExecutors } from '../hooks/useExecutors';
import { useSparkVisibility } from './SparkMonitorPanel';

/**
 * Conditional amber banner shown when any executor spills to disk.
 */
export const SpillWarning: React.FC = () => {
  const isVisible = useSparkVisibility();
  const { data } = useExecutors(isVisible);

  if (!data) {
    return null;
  }

  const spillingIds = data.filter(e => e.diskUsed > 0).map(e => e.id);

  if (spillingIds.length === 0) {
    return null;
  }

  return (
    <div className="spark-monitor-spill-warning">
      Disk spill detected on executor(s): {spillingIds.join(', ')}
    </div>
  );
};
