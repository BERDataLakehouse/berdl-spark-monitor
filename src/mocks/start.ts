import { PageConfig, URLExt } from '@jupyterlab/coreutils';
import { EXTENSION_ID } from '../constants';

export async function startMockServiceWorker(): Promise<void> {
  try {
    const { worker } = await import('./browser');
    await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
    // Warm-up fetch to ensure service worker is intercepting before components mount
    await fetch(
      URLExt.join(PageConfig.getBaseUrl(), 'berdl/api/spark-monitor/status')
    );
    console.log(`${EXTENSION_ID}: Mock Service Worker started`);
  } catch (error) {
    console.error(
      `${EXTENSION_ID}: Failed to start Mock Service Worker:`,
      error
    );
  }
}
