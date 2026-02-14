import type {
  ISparkClusterStatus,
  ISparkClusterCreateResponse,
  ISparkMasterSummary,
  IExecutorSummary,
  IStageSummary
} from '../types';

/**
 * Mock cluster status: healthy 4-worker cluster, all ready.
 * Drives StatusBarWidget → green dot, "Spark: Ready (4/4)".
 */
export const mockClusterStatus: ISparkClusterStatus = {
  master: {
    available_replicas: 1,
    ready_replicas: 1,
    replicas: 1,
    unavailable_replicas: 0,
    is_ready: true,
    exists: true,
    error: null
  },
  workers: {
    available_replicas: 4,
    ready_replicas: 4,
    replicas: 4,
    unavailable_replicas: 0,
    is_ready: true,
    exists: true,
    error: null
  },
  master_url: 'spark://spark-master-mockuser.jupyterhub:7077',
  master_ui_url: 'http://spark-master-mockuser.jupyterhub:8090',
  error: null
};

/**
 * Mock master summary: 16 cores (12 used → 75%), 128GB memory (96GB used → 75%).
 * Drives ClusterOverview → amber resource bars (> 70% threshold).
 */
export const mockClusterSummary: ISparkMasterSummary = {
  url: 'spark://spark-master-mockuser.jupyterhub:7077',
  workers: [
    {
      id: 'worker-20250101000000-10.0.0.11-40000',
      host: '10.0.0.11',
      port: 40000,
      cores: 4,
      coresUsed: 3,
      coresFree: 1,
      memory: 34359738368, // 32 GiB
      memoryUsed: 25769803776, // 24 GiB
      memoryFree: 8589934592, // 8 GiB
      state: 'ALIVE'
    },
    {
      id: 'worker-20250101000000-10.0.0.12-40000',
      host: '10.0.0.12',
      port: 40000,
      cores: 4,
      coresUsed: 3,
      coresFree: 1,
      memory: 34359738368,
      memoryUsed: 25769803776,
      memoryFree: 8589934592,
      state: 'ALIVE'
    },
    {
      id: 'worker-20250101000000-10.0.0.13-40000',
      host: '10.0.0.13',
      port: 40000,
      cores: 4,
      coresUsed: 3,
      coresFree: 1,
      memory: 34359738368,
      memoryUsed: 25769803776,
      memoryFree: 8589934592,
      state: 'ALIVE'
    },
    {
      id: 'worker-20250101000000-10.0.0.14-40000',
      host: '10.0.0.14',
      port: 40000,
      cores: 4,
      coresUsed: 3,
      coresFree: 1,
      memory: 34359738368,
      memoryUsed: 25769803776,
      memoryFree: 8589934592,
      state: 'ALIVE'
    }
  ],
  aliveworkers: 4,
  cores: 16,
  coresused: 12,
  memory: 137438953472, // 128 GiB total
  memoryused: 103079215104, // 96 GiB used (75%)
  activeapps: [
    {
      id: 'app-20250101120000-0000',
      name: 'spark-connect-session',
      cores: 12,
      memoryperslave: 25769803776,
      state: 'RUNNING',
      starttime: Date.now() - 3600000,
      duration: 3600000
    }
  ],
  completedapps: [],
  status: 'ALIVE'
};

/**
 * Mock executors: 4 executors exercising various UI states.
 *  - executor-0: normal (baseline)
 *  - executor-1: high task count
 *  - executor-2: disk spill (triggers SpillWarning banner + red text)
 *  - executor-3: high GC (> 10% of duration → amber GC text)
 */
export const mockExecutors: IExecutorSummary[] = [
  {
    id: '0',
    hostPort: '10.0.0.11:40000',
    isActive: true,
    rddBlocks: 4,
    memoryUsed: 536870912, // 512 MB
    diskUsed: 0,
    totalCores: 3,
    maxTasks: 3,
    activeTasks: 1,
    failedTasks: 0,
    completedTasks: 48,
    totalTasks: 49,
    totalDuration: 120000,
    totalGCTime: 3200, // 2.7% — normal
    totalInputBytes: 2147483648, // 2 GB
    totalShuffleRead: 1073741824, // 1 GB
    totalShuffleWrite: 536870912, // 512 MB
    maxMemory: 4294967296, // 4 GB
    memoryMetrics: {
      usedOnHeapStorageMemory: 402653184,
      usedOffHeapStorageMemory: 0,
      totalOnHeapStorageMemory: 4294967296,
      totalOffHeapStorageMemory: 0
    }
  },
  {
    id: '1',
    hostPort: '10.0.0.12:40000',
    isActive: true,
    rddBlocks: 6,
    memoryUsed: 1073741824, // 1 GB
    diskUsed: 0,
    totalCores: 3,
    maxTasks: 3,
    activeTasks: 3,
    failedTasks: 1,
    completedTasks: 72,
    totalTasks: 76,
    totalDuration: 180000,
    totalGCTime: 5400, // 3% — normal
    totalInputBytes: 3221225472, // 3 GB
    totalShuffleRead: 2147483648, // 2 GB
    totalShuffleWrite: 1073741824, // 1 GB
    maxMemory: 4294967296,
    memoryMetrics: {
      usedOnHeapStorageMemory: 805306368,
      usedOffHeapStorageMemory: 0,
      totalOnHeapStorageMemory: 4294967296,
      totalOffHeapStorageMemory: 0
    }
  },
  {
    id: '2',
    hostPort: '10.0.0.13:40000',
    isActive: true,
    rddBlocks: 3,
    memoryUsed: 3758096384, // 3.5 GB
    diskUsed: 268435456, // 256 MB — triggers SpillWarning + red text
    totalCores: 3,
    maxTasks: 3,
    activeTasks: 2,
    failedTasks: 0,
    completedTasks: 55,
    totalTasks: 57,
    totalDuration: 150000,
    totalGCTime: 6000, // 4% — normal
    totalInputBytes: 4294967296, // 4 GB
    totalShuffleRead: 3221225472, // 3 GB
    totalShuffleWrite: 2147483648, // 2 GB
    maxMemory: 4294967296,
    memoryMetrics: {
      usedOnHeapStorageMemory: 3489660928,
      usedOffHeapStorageMemory: 0,
      totalOnHeapStorageMemory: 4294967296,
      totalOffHeapStorageMemory: 0
    }
  },
  {
    id: '3',
    hostPort: '10.0.0.14:40000',
    isActive: true,
    rddBlocks: 2,
    memoryUsed: 805306368, // 768 MB
    diskUsed: 0,
    totalCores: 3,
    maxTasks: 3,
    activeTasks: 0,
    failedTasks: 0,
    completedTasks: 41,
    totalTasks: 41,
    totalDuration: 90000,
    totalGCTime: 14400, // 16% — triggers amber GC text (> 10%)
    totalInputBytes: 1610612736, // 1.5 GB
    totalShuffleRead: 805306368, // 768 MB
    totalShuffleWrite: 402653184, // 384 MB
    maxMemory: 4294967296,
    memoryMetrics: {
      usedOnHeapStorageMemory: 671088640,
      usedOffHeapStorageMemory: 0,
      totalOnHeapStorageMemory: 4294967296,
      totalOffHeapStorageMemory: 0
    }
  }
];

const now = new Date();

/**
 * Mock stages: 1 ACTIVE (~60%), 2 COMPLETE, 1 FAILED.
 * Exercises ActiveStages (progress bar) + QueryHistory (green/red indicators).
 */
export const mockStages: IStageSummary[] = [
  {
    status: 'ACTIVE',
    stageId: 3,
    attemptId: 0,
    numTasks: 200,
    numActiveTasks: 80,
    numCompleteTasks: 120, // 60% progress
    numFailedTasks: 0,
    executorRunTime: 45000,
    inputBytes: 2147483648,
    inputRecords: 5000000,
    outputBytes: 536870912,
    outputRecords: 1200000,
    shuffleReadBytes: 1073741824,
    shuffleWriteBytes: 805306368,
    memoryBytesSpilled: 0,
    diskBytesSpilled: 0,
    name: 'SELECT * FROM kbase_genome.features WHERE conservation > 0.8',
    submissionTime: new Date(now.getTime() - 30000).toISOString()
  },
  {
    status: 'COMPLETE',
    stageId: 2,
    attemptId: 0,
    numTasks: 100,
    numActiveTasks: 0,
    numCompleteTasks: 100,
    numFailedTasks: 0,
    executorRunTime: 28000,
    inputBytes: 1073741824,
    inputRecords: 2500000,
    outputBytes: 268435456,
    outputRecords: 600000,
    shuffleReadBytes: 536870912,
    shuffleWriteBytes: 268435456,
    memoryBytesSpilled: 0,
    diskBytesSpilled: 0,
    name: 'SHOW TABLES IN kbase_genome',
    submissionTime: new Date(now.getTime() - 120000).toISOString(),
    completionTime: new Date(now.getTime() - 92000).toISOString()
  },
  {
    status: 'COMPLETE',
    stageId: 1,
    attemptId: 0,
    numTasks: 50,
    numActiveTasks: 0,
    numCompleteTasks: 50,
    numFailedTasks: 0,
    executorRunTime: 12000,
    inputBytes: 536870912,
    inputRecords: 1000000,
    outputBytes: 134217728,
    outputRecords: 250000,
    shuffleReadBytes: 268435456,
    shuffleWriteBytes: 134217728,
    memoryBytesSpilled: 0,
    diskBytesSpilled: 0,
    name: 'SELECT COUNT(*) FROM u_mockuser__ecoli_genes',
    submissionTime: new Date(now.getTime() - 300000).toISOString(),
    completionTime: new Date(now.getTime() - 288000).toISOString()
  },
  {
    status: 'FAILED',
    stageId: 0,
    attemptId: 0,
    numTasks: 150,
    numActiveTasks: 0,
    numCompleteTasks: 87,
    numFailedTasks: 63,
    executorRunTime: 35000,
    inputBytes: 1610612736,
    inputRecords: 3500000,
    outputBytes: 0,
    outputRecords: 0,
    shuffleReadBytes: 805306368,
    shuffleWriteBytes: 402653184,
    memoryBytesSpilled: 134217728,
    diskBytesSpilled: 67108864,
    name: 'INSERT INTO u_mockuser__results SELECT ...',
    submissionTime: new Date(now.getTime() - 600000).toISOString(),
    completionTime: new Date(now.getTime() - 565000).toISOString()
  }
];

export const mockClusterCreateResponse: ISparkClusterCreateResponse = {
  cluster_id: 'spark-mockuser-abc12345',
  master_url: 'spark://spark-master-mockuser.jupyterhub:7077',
  master_ui_url: 'http://spark-master-mockuser.jupyterhub:8090'
};
