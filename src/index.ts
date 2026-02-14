import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ReactWidget } from '@jupyterlab/apputils';
import { PageConfig, URLExt } from '@jupyterlab/coreutils';
import { Panel } from '@lumino/widgets';
import { Message } from '@lumino/messaging';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import {
  EXTENSION_ID,
  PLUGIN_ID,
  PANEL_ID,
  COMMAND_OPEN_PANEL,
  sparkMonitorIcon
} from './constants';
import { SparkMonitorPanel as SparkMonitorPanelComponent } from './components/SparkMonitorPanel';

async function startMockServiceWorker(): Promise<void> {
  try {
    const { worker } = await import('./mocks/browser');
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

/**
 * Lumino Panel subclass that tracks visibility for React polling control.
 */
class SparkMonitorPanel extends Panel {
  private _visibilityCallback: ((visible: boolean) => void) | null = null;

  setVisibilityCallback(cb: (visible: boolean) => void): void {
    this._visibilityCallback = cb;
  }

  protected onAfterShow(msg: Message): void {
    super.onAfterShow(msg);
    this._visibilityCallback?.(true);
  }

  protected onAfterHide(msg: Message): void {
    super.onAfterHide(msg);
    this._visibilityCallback?.(false);
  }
}

const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  description: 'JupyterLab extension for Spark cluster monitoring',
  autoStart: true,
  optional: [ILayoutRestorer],
  activate: async (
    app: JupyterFrontEnd,
    restorer: ILayoutRestorer | null
  ) => {
    // Gate on server extension enabling the feature
    if (PageConfig.getOption('sparkMonitorEnabled') !== 'true') {
      console.log(`${EXTENSION_ID}: disabled (sparkMonitorEnabled not set)`);
      return;
    }

    if (PageConfig.getOption('sparkMonitorMockMode') === 'true') {
      await startMockServiceWorker();
    }

    console.log(`${EXTENSION_ID}: activated`);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          staleTime: 10_000
        }
      }
    });

    // --- Sidebar panel ---
    // visibilityRef bridges Lumino→React: Lumino writes immediately,
    // React reads on mount to get correct initial state even if
    // onAfterShow fires before the React tree mounts (layout restore).
    const visibilityRef = { current: false };
    const setVisibleRef = {
      current: (_v: boolean) => {
        /* replaced by React */
      }
    };

    const panel = new SparkMonitorPanel();
    panel.id = PANEL_ID;
    panel.title.icon = sparkMonitorIcon;
    panel.title.caption = 'Spark Monitor';
    panel.setVisibilityCallback(v => {
      visibilityRef.current = v;
      setVisibleRef.current(v);
    });

    const panelContent = ReactWidget.create(
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(SparkMonitorPanelComponent, {
          panelId: PANEL_ID,
          setVisibleRef,
          visibilityRef
        })
      )
    );
    panelContent.node.style.height = '100%';
    panelContent.node.style.overflow = 'hidden';
    panel.addWidget(panelContent);
    app.shell.add(panel, 'left', { rank: 1100 });

    if (restorer) {
      restorer.add(panel, EXTENSION_ID);
    }

    // --- Command to open panel ---
    app.commands.addCommand(COMMAND_OPEN_PANEL, {
      label: 'Spark Monitor',
      execute: () => {
        app.shell.activateById(PANEL_ID);
      }
    });

  }
};

export default plugin;
