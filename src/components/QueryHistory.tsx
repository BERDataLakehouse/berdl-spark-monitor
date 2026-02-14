import React, { useState } from 'react';
import { useStages } from '../hooks/useStages';
import { useSparkVisibility } from './SparkMonitorPanel';
import { formatBytes, formatDuration } from '../utils/format';
import type { IStageSummary } from '../types';

const StageRow: React.FC<{ stage: IStageSummary }> = ({ stage }) => {
  const [expanded, setExpanded] = useState(false);
  const isSuccess = stage.status === 'COMPLETE';

  return (
    <div className="spark-monitor-history-row">
      <button
        className="spark-monitor-history-row-header"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <span
          className={
            isSuccess ? 'spark-monitor-text--green' : 'spark-monitor-text--red'
          }
        >
          {isSuccess ? '\u2713' : '\u2717'}
        </span>
        <span className="spark-monitor-history-name">{stage.name}</span>
        <span className="spark-monitor-history-duration">
          {formatDuration(stage.executorRunTime)}
        </span>
      </button>
      {expanded && (
        <div className="spark-monitor-history-detail">
          <div>
            Tasks: {stage.numCompleteTasks}/{stage.numTasks} (failed:{' '}
            {stage.numFailedTasks})
          </div>
          <div>
            Input: {formatBytes(stage.inputBytes)} | Output:{' '}
            {formatBytes(stage.outputBytes)}
          </div>
          <div>
            Shuffle R/W: {formatBytes(stage.shuffleReadBytes)} /{' '}
            {formatBytes(stage.shuffleWriteBytes)}
          </div>
          {stage.diskBytesSpilled > 0 && (
            <div className="spark-monitor-text--amber">
              Disk spill: {formatBytes(stage.diskBytesSpilled)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const QueryHistory: React.FC = () => {
  const isVisible = useSparkVisibility();
  const { recent, isLoading } = useStages(isVisible);

  if (isLoading) {
    return <div className="spark-monitor-history">Loading history...</div>;
  }

  if (recent.length === 0) {
    return <div className="spark-monitor-history">No completed stages</div>;
  }

  return (
    <div className="spark-monitor-history">
      {recent.map(stage => (
        <StageRow key={`${stage.stageId}-${stage.attemptId}`} stage={stage} />
      ))}
    </div>
  );
};
