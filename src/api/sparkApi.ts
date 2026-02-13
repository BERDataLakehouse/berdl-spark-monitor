import { URLExt } from '@jupyterlab/coreutils';
import { PageConfig } from '@jupyterlab/coreutils';

import type {
  ISparkClusterStatus,
  ISparkMasterSummary,
  IExecutorSummary,
  IStageSummary
} from '../types';

const API_PREFIX = 'berdl/api/spark-monitor';

export class SparkApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'SparkApiError';
  }
}

async function fetchJson<T>(path: string): Promise<T> {
  const url = URLExt.join(PageConfig.getBaseUrl(), API_PREFIX, path);
  const resp = await fetch(url, { credentials: 'same-origin' });
  if (!resp.ok) {
    throw new SparkApiError(
      `${resp.status} ${resp.statusText}`,
      resp.status
    );
  }
  return resp.json();
}

export async function fetchClusterStatus(): Promise<ISparkClusterStatus> {
  return fetchJson<ISparkClusterStatus>('status');
}

export async function fetchClusterSummary(): Promise<ISparkMasterSummary> {
  return fetchJson<ISparkMasterSummary>('cluster');
}

export async function fetchExecutors(): Promise<IExecutorSummary[]> {
  const data = await fetchJson<IExecutorSummary[] | { executors: IExecutorSummary[] }>(
    'app/executors'
  );
  // Server returns array directly from Spark, or wrapped object if no active app
  return Array.isArray(data) ? data : data.executors;
}

export async function fetchStages(): Promise<IStageSummary[]> {
  const data = await fetchJson<IStageSummary[] | { stages: IStageSummary[] }>(
    'app/stages'
  );
  return Array.isArray(data) ? data : data.stages;
}
