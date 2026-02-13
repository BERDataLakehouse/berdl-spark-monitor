import React from 'react';
import { useStages } from '../hooks/useStages';
import { useSparkVisibility } from './SparkMonitorPanel';
import { formatBytes } from '../utils/format';

export const ActiveStages: React.FC = () => {
  const isVisible = useSparkVisibility();
  const { active, isLoading, isError } = useStages(isVisible);

  if (isLoading) {
    return <div className="spark-monitor-stages">Loading stages...</div>;
  }

  if (isError) {
    return <div className="spark-monitor-stages">Error loading stages</div>;
  }

  if (active.length === 0) {
    return <div className="spark-monitor-stages">No active stages</div>;
  }

  return (
    <div className="spark-monitor-stages">
      {active.map(stage => {
        const pct = stage.numTasks > 0
          ? (stage.numCompleteTasks / stage.numTasks) * 100
          : 0;
        return (
          <div key={`${stage.stageId}-${stage.attemptId}`} className="spark-monitor-stage">
            <div className="spark-monitor-stage-header">
              <span className="spark-monitor-stage-name">{stage.name}</span>
              <span className="spark-monitor-stage-progress">
                {stage.numCompleteTasks}/{stage.numTasks}
              </span>
            </div>
            <div className="spark-monitor-resource-bar-track">
              <div
                className="spark-monitor-resource-bar-fill spark-monitor-resource-bar-fill--green"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="spark-monitor-stage-metrics">
              In: {formatBytes(stage.inputBytes)} | Out: {formatBytes(stage.outputBytes)} | Shuffle: {formatBytes(stage.shuffleReadBytes)}/{formatBytes(stage.shuffleWriteBytes)}
            </div>
          </div>
        );
      })}
    </div>
  );
};
