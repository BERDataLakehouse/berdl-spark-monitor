import { LabIcon } from '@jupyterlab/ui-components';

export const EXTENSION_ID = 'berdl-spark-monitor';
export const PLUGIN_ID = `${EXTENSION_ID}:plugin`;
export const PANEL_ID = `${EXTENSION_ID}:panel`;
export const COMMAND_OPEN_PANEL = `${EXTENSION_ID}:open`;

// Polling intervals (ms)
export const POLL_STATUS = 30_000; // Status bar — always active
export const POLL_CLUSTER_SUMMARY = 30_000; // Sidebar overview — visibility-aware
export const POLL_EXECUTORS_ACTIVE = 10_000; // Executors when tasks running
export const POLL_EXECUTORS_IDLE = 30_000; // Executors when idle
export const POLL_STAGES_ACTIVE = 5_000; // Stages when active
export const POLL_STAGES_IDLE = 30_000; // Stages when idle

// Gauge SVG icon for sidebar + status bar
const gaugeSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
  '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 ' +
  '18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm1 ' +
  '8.5l3.5-3.5-1.41-1.41L12 13.17l-2.09-2.09L8.5 12.5z"/></svg>';

export const sparkMonitorIcon = new LabIcon({
  name: `${EXTENSION_ID}:gauge`,
  svgstr: gaugeSvg
});
