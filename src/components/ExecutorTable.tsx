import React from 'react';
import { formatBytes, formatDuration } from '../utils/format';
import type { IExecutorSummary } from '../types';

interface IProps {
  executors: IExecutorSummary[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export const ExecutorTable: React.FC<IProps> = ({
  executors,
  isLoading,
  isError
}) => {
  if (isLoading) {
    return <div className="spark-monitor-executors">Loading executors...</div>;
  }

  if (isError) {
    return (
      <div className="spark-monitor-executors">Error loading executors</div>
    );
  }

  if (!executors || executors.length === 0) {
    return (
      <div className="spark-monitor-executors">No active Spark session</div>
    );
  }

  return (
    <div className="spark-monitor-executors">
      {executors.map(exec => {
        const gcPct =
          exec.totalDuration > 0
            ? (exec.totalGCTime / exec.totalDuration) * 100
            : 0;
        return (
          <div key={exec.id} className="spark-monitor-executor-card">
            <div className="spark-monitor-executor-card-header">
              <span className="spark-monitor-executor-card-id">
                Executor {exec.id}
              </span>
              <span className="spark-monitor-executor-card-tasks">
                {exec.activeTasks} active / {exec.completedTasks} done
              </span>
            </div>
            <div className="spark-monitor-executor-card-metrics">
              <span>
                Mem {formatBytes(exec.memoryUsed)} /{' '}
                {formatBytes(exec.maxMemory)}
              </span>
              <span
                className={exec.diskUsed > 0 ? 'spark-monitor-text--red' : ''}
              >
                Disk {formatBytes(exec.diskUsed)}
              </span>
              <span>
                Shuf {formatBytes(exec.totalShuffleRead)} /{' '}
                {formatBytes(exec.totalShuffleWrite)}
              </span>
              <span className={gcPct > 10 ? 'spark-monitor-text--amber' : ''}>
                GC {formatDuration(exec.totalGCTime)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
