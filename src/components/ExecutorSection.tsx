import React from 'react';
import { useExecutors } from '../hooks/useExecutors';
import { useSparkVisibility } from '../contexts/SparkVisibilityContext';
import { SpillWarning } from './SpillWarning';
import { ExecutorTable } from './ExecutorTable';

/**
 * Wrapper that calls useExecutors once and passes data down to
 * SpillWarning and ExecutorTable as props.
 */
export const ExecutorSection: React.FC = () => {
  const isVisible = useSparkVisibility();
  const { data, isLoading, isError } = useExecutors(isVisible);

  return (
    <>
      <SpillWarning executors={data} />
      <ExecutorTable executors={data} isLoading={isLoading} isError={isError} />
    </>
  );
};
