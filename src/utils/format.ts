const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

/**
 * Format bytes into a human-readable string.
 * e.g. 1536 -> "1.5 KB"
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return '0 B';
  }
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024));
  const idx = Math.min(i, UNITS.length - 1);
  const val = bytes / Math.pow(1024, idx);
  return `${val.toFixed(idx === 0 ? 0 : 1)} ${UNITS[idx]}`;
}

/**
 * Format milliseconds into a human-readable duration.
 * e.g. 125000 -> "2m 5s"
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainSec = seconds % 60;
  if (minutes < 60) {
    return remainSec > 0 ? `${minutes}m ${remainSec}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainMin = minutes % 60;
  return remainMin > 0 ? `${hours}h ${remainMin}m` : `${hours}h`;
}
