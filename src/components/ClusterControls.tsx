import React, { useCallback, useState } from 'react';
import { useClusterStatus } from '../hooks/useClusterStatus';
import { useStartCluster, useStopCluster } from '../hooks/useClusterActions';

export const ClusterControls: React.FC = () => {
  const { data } = useClusterStatus();
  const startMutation = useStartCluster();
  const stopMutation = useStopCluster();
  const [showNotice, setShowNotice] = useState(false);

  const isMutating = startMutation.isPending || stopMutation.isPending;

  const handleStart = useCallback(() => {
    setShowNotice(false);
    startMutation.mutate(undefined, {
      onSuccess: () => setShowNotice(true)
    });
  }, [startMutation]);

  const handleStop = useCallback(() => {
    setShowNotice(false);
    stopMutation.mutate();
  }, [stopMutation]);

  const handleRestart = useCallback(() => {
    setShowNotice(false);
    stopMutation.mutate(undefined, {
      onSuccess: () => {
        startMutation.mutate(undefined, {
          onSuccess: () => setShowNotice(true)
        });
      }
    });
  }, [stopMutation, startMutation]);

  if (!data) {
    return null;
  }

  const hasCluster = data.master.exists || data.workers.exists;
  const isReady = data.master.is_ready && data.workers.is_ready;
  const isStarting = hasCluster && !isReady;
  const error = startMutation.error || stopMutation.error;

  return (
    <div className="spark-monitor-controls">
      {!hasCluster && !isMutating && (
        <button className="spark-monitor-btn" onClick={handleStart}>
          Start Cluster
        </button>
      )}
      {(isStarting || startMutation.isPending) && !stopMutation.isPending && (
        <button className="spark-monitor-btn" disabled>
          Starting&hellip;
        </button>
      )}
      {isReady && !isMutating && (
        <>
          <button
            className="spark-monitor-btn spark-monitor-btn--danger"
            onClick={handleStop}
          >
            Stop
          </button>
          <button className="spark-monitor-btn" onClick={handleRestart}>
            Restart
          </button>
        </>
      )}
      {stopMutation.isPending && (
        <button className="spark-monitor-btn" disabled>
          Stopping&hellip;
        </button>
      )}
      {error && (
        <div className="spark-monitor-notice spark-monitor-notice--error">
          {(error as Error).message}
        </div>
      )}
      {showNotice && (
        <div className="spark-monitor-notice">
          Run <code>start_spark_connect_server(force_restart=True)</code> in
          your notebook to reconnect.
        </div>
      )}
    </div>
  );
};
