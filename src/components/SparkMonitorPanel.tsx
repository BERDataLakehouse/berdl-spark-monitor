import React, { createContext, useContext, useEffect, useState } from 'react';
import { ClusterOverview } from './ClusterOverview';
import { ExecutorTable } from './ExecutorTable';
import { SpillWarning } from './SpillWarning';
import { ActiveStages } from './ActiveStages';
import { QueryHistory } from './QueryHistory';
import { CollapsibleSection } from './CollapsibleSection';
import { StatusDot } from './StatusDot';
import { useTabBadge } from './TabBadge';
import { sparkMonitorIcon } from '../constants';

/**
 * React context providing sidebar visibility state to hooks.
 * Default false — hooks won't poll until panel is shown.
 */
export const SparkVisibilityContext = createContext(false);

export function useSparkVisibility(): boolean {
  return useContext(SparkVisibilityContext);
}

interface IProps {
  panelId: string;
  setVisibleRef: { current: (v: boolean) => void };
  visibilityRef: { current: boolean };
}

export const SparkMonitorPanel: React.FC<IProps> = ({
  panelId,
  setVisibleRef,
  visibilityRef
}) => {
  const [isVisible, setIsVisible] = useState(() => visibilityRef.current);
  useTabBadge(panelId);

  useEffect(() => {
    setVisibleRef.current = setIsVisible;
    // Sync in case onAfterShow fired between render and effect
    setIsVisible(visibilityRef.current);
  }, [setVisibleRef, visibilityRef]);

  return (
    <SparkVisibilityContext.Provider value={isVisible}>
      <div className="spark-monitor-panel">
        <div className="spark-monitor-panel-content">
          <CollapsibleSection title="Cluster" defaultOpen suffix={<StatusDot />}>
            <ClusterOverview />
          </CollapsibleSection>
          <CollapsibleSection title="Executors" defaultOpen>
            <SpillWarning />
            <ExecutorTable />
          </CollapsibleSection>
          <CollapsibleSection title="Active Stages" defaultOpen>
            <ActiveStages />
          </CollapsibleSection>
          <CollapsibleSection title="Recent Queries" defaultOpen={false}>
            <QueryHistory />
          </CollapsibleSection>
        </div>
        <div className="spark-monitor-footer">
          Powered by Apache Spark{' '}
          <sparkMonitorIcon.react
            tag="span"
            className="spark-monitor-footer-logo"
          />
        </div>
      </div>
    </SparkVisibilityContext.Provider>
  );
};
