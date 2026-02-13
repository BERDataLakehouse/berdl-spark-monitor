import React, { createContext, useContext, useEffect, useState } from 'react';
import { ClusterOverview } from './ClusterOverview';
import { ExecutorTable } from './ExecutorTable';
import { SpillWarning } from './SpillWarning';
import { ActiveStages } from './ActiveStages';
import { QueryHistory } from './QueryHistory';
import { CollapsibleSection } from './CollapsibleSection';

/**
 * React context providing sidebar visibility state to hooks.
 * Default false — hooks won't poll until panel is shown.
 */
export const SparkVisibilityContext = createContext(false);

export function useSparkVisibility(): boolean {
  return useContext(SparkVisibilityContext);
}

interface IProps {
  setVisibleRef: { current: (v: boolean) => void };
}

export const SparkMonitorPanel: React.FC<IProps> = ({ setVisibleRef }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setVisibleRef.current = setIsVisible;
  }, [setVisibleRef]);

  return (
    <SparkVisibilityContext.Provider value={isVisible}>
      <div className="spark-monitor-panel">
        <ClusterOverview />
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
    </SparkVisibilityContext.Provider>
  );
};
