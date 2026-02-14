import React from 'react';
import { useClusterStatus } from '../hooks/useClusterStatus';
import { deriveBadge } from './TabBadge';

export const StatusDot: React.FC = () => {
  const { data, isLoading, isError } = useClusterStatus();
  const color = deriveBadge(data, isLoading, isError);

  return <span className={`spark-monitor-dot spark-monitor-dot--${color}`} />;
};
