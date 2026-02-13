import React from 'react';
import { useExecutors } from '../hooks/useExecutors';
import { useSparkVisibility } from './SparkMonitorPanel';
import { formatBytes, formatDuration } from '../utils/format';

export const ExecutorTable: React.FC = () => {
  const isVisible = useSparkVisibility();
  const { data, isLoading, isError } = useExecutors(isVisible);

  if (isLoading) {
    return <div className="spark-monitor-executors">Loading executors...</div>;
  }

  if (isError) {
    return <div className="spark-monitor-executors">Error loading executors</div>;
  }

  if (!data || data.length === 0) {
    return <div className="spark-monitor-executors">No active Spark session</div>;
  }

  return (
    <div className="spark-monitor-executors">
      <table className="spark-monitor-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tasks</th>
            <th>Memory</th>
            <th>Disk</th>
            <th>Shuffle R/W</th>
            <th>GC</th>
          </tr>
        </thead>
        <tbody>
          {data.map(exec => {
            const gcPct = exec.totalDuration > 0
              ? (exec.totalGCTime / exec.totalDuration) * 100
              : 0;
            return (
              <tr key={exec.id}>
                <td>{exec.id}</td>
                <td>{exec.activeTasks}</td>
                <td>{formatBytes(exec.memoryUsed)} / {formatBytes(exec.maxMemory)}</td>
                <td className={exec.diskUsed > 0 ? 'spark-monitor-text--red' : ''}>
                  {formatBytes(exec.diskUsed)}
                </td>
                <td>
                  {formatBytes(exec.totalShuffleRead)} / {formatBytes(exec.totalShuffleWrite)}
                </td>
                <td className={gcPct > 10 ? 'spark-monitor-text--amber' : ''}>
                  {formatDuration(exec.totalGCTime)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
