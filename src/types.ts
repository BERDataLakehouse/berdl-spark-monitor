// --- Spark Cluster Manager API types ---

export interface IDeploymentStatus {
  available_replicas: number;
  ready_replicas: number;
  replicas: number;
  unavailable_replicas: number;
  is_ready: boolean;
  exists: boolean;
  error: string | null;
}

export interface ISparkClusterStatus {
  master: IDeploymentStatus;
  workers: IDeploymentStatus;
  master_url: string;
  master_ui_url: string;
  error: string | null;
}

// --- Spark Master REST API types ---

export interface ISparkWorkerInfo {
  id: string;
  host: string;
  port: number;
  cores: number;
  coresUsed: number;
  coresFree: number;
  memory: number;
  memoryUsed: number;
  memoryFree: number;
  state: string;
}

export interface ISparkAppInfo {
  id: string;
  name: string;
  cores: number;
  memoryperslave: number;
  state: string;
  starttime: number;
  duration: number;
}

export interface ISparkMasterSummary {
  url: string;
  workers: ISparkWorkerInfo[];
  aliveworkers: number;
  cores: number;
  coresused: number;
  memory: number;
  memoryused: number;
  activeapps: ISparkAppInfo[];
  completedapps: ISparkAppInfo[];
  status: string;
}

// --- Spark Application REST API types ---

export interface IExecutorSummary {
  id: string;
  hostPort: string;
  isActive: boolean;
  rddBlocks: number;
  memoryUsed: number;
  diskUsed: number;
  totalCores: number;
  maxTasks: number;
  activeTasks: number;
  failedTasks: number;
  completedTasks: number;
  totalTasks: number;
  totalDuration: number;
  totalGCTime: number;
  totalInputBytes: number;
  totalShuffleRead: number;
  totalShuffleWrite: number;
  maxMemory: number;
  memoryMetrics?: {
    usedOnHeapStorageMemory: number;
    usedOffHeapStorageMemory: number;
    totalOnHeapStorageMemory: number;
    totalOffHeapStorageMemory: number;
  };
}

export interface IStageSummary {
  status: 'ACTIVE' | 'COMPLETE' | 'PENDING' | 'FAILED' | 'SKIPPED';
  stageId: number;
  attemptId: number;
  numTasks: number;
  numActiveTasks: number;
  numCompleteTasks: number;
  numFailedTasks: number;
  executorRunTime: number;
  inputBytes: number;
  inputRecords: number;
  outputBytes: number;
  outputRecords: number;
  shuffleReadBytes: number;
  shuffleWriteBytes: number;
  memoryBytesSpilled: number;
  diskBytesSpilled: number;
  name: string;
  submissionTime?: string;
  completionTime?: string;
}

// --- Cluster Management types ---

export interface ISparkClusterConfig {
  worker_count?: number;
  worker_cores?: number;
  worker_memory?: string;
  master_cores?: number;
  master_memory?: string;
}

export interface ISparkClusterCreateResponse {
  cluster_id: string;
  master_url: string;
  master_ui_url: string;
}
