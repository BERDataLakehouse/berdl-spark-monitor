import React, { useEffect, useState } from 'react';
import { ClusterOverview } from './ClusterOverview';
import { ExecutorSection } from './ExecutorSection';
import { ActiveStages } from './ActiveStages';
import { QueryHistory } from './QueryHistory';
import { CollapsibleSection } from './CollapsibleSection';
import { StatusDot } from './StatusDot';
import { useTabBadge } from './TabBadge';
import { SparkVisibilityContext } from '../contexts/SparkVisibilityContext';
import { sparkMonitorIcon } from '../constants';
import type { SparkMonitorLuminoPanel } from '../SparkMonitorLuminoPanel';

interface IProps {
  panelId: string;
  luminoPanel: SparkMonitorLuminoPanel;
}

export const SparkMonitorPanel: React.FC<IProps> = ({
  panelId,
  luminoPanel
}) => {
  const [isVisible, setIsVisible] = useState(() => luminoPanel.getVisibility());
  useTabBadge(panelId);

  useEffect(() => {
    luminoPanel.setVisibilityCallback(setIsVisible);
  }, [luminoPanel]);

  return (
    <SparkVisibilityContext.Provider value={isVisible}>
      <div className="spark-monitor-panel">
        <div className="spark-monitor-panel-content">
          <CollapsibleSection
            title="Cluster"
            defaultOpen
            suffix={<StatusDot />}
          >
            <ClusterOverview />
          </CollapsibleSection>
          <CollapsibleSection title="Executors" defaultOpen>
            <ExecutorSection />
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
