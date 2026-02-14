import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ReactWidget } from '@jupyterlab/apputils';
import { IStatusBar } from '@jupyterlab/statusbar';
import { PageConfig } from '@jupyterlab/coreutils';
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
import { StatusBarWidget } from './components/StatusBarWidget';
import { SparkMonitorPanel as SparkMonitorPanelComponent } from './components/SparkMonitorPanel';

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
  optional: [IStatusBar, ILayoutRestorer],
  activate: (
    app: JupyterFrontEnd,
    statusBar: IStatusBar | null,
    restorer: ILayoutRestorer | null
  ) => {
    // Gate on server extension enabling the feature
    if (PageConfig.getOption('sparkMonitorEnabled') !== 'true') {
      console.log(`${EXTENSION_ID}: disabled (sparkMonitorEnabled not set)`);
      return;
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
      setVisibleRef.current(v);
    });

    const panelContent = ReactWidget.create(
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(SparkMonitorPanelComponent, { setVisibleRef })
      )
    );
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

    // --- Status bar widget ---
    if (statusBar) {
      const statusWidget = ReactWidget.create(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(StatusBarWidget, {
            onClick: () => app.commands.execute(COMMAND_OPEN_PANEL)
          })
        )
      );
      statusWidget.id = `${EXTENSION_ID}:status`;

      statusBar.registerStatusItem(statusWidget.id, {
        item: statusWidget,
        align: 'left'
      });
    }
  }
};

export default plugin;
