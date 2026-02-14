import React from 'react';
import type { IExecutorSummary } from '../types';

interface IProps {
  executors: IExecutorSummary[] | undefined;
}

/**
 * Conditional amber banner shown when any executor spills to disk.
 */
export const SpillWarning: React.FC<IProps> = ({ executors }) => {
  if (!executors) {
    return null;
  }

  const spillingIds = executors.filter(e => e.diskUsed > 0).map(e => e.id);

  if (spillingIds.length === 0) {
    return null;
  }

  return (
    <div className="spark-monitor-spill-warning">
      Disk spill detected on executor(s): {spillingIds.join(', ')}
    </div>
  );
};
