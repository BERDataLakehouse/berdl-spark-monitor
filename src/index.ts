import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ReactWidget } from '@jupyterlab/apputils';
import { PageConfig } from '@jupyterlab/coreutils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import {
  EXTENSION_ID,
  PLUGIN_ID,
  PANEL_ID,
  COMMAND_OPEN_PANEL,
  sparkMonitorIcon
} from './constants';
import { SparkMonitorLuminoPanel } from './SparkMonitorLuminoPanel';
import { SparkMonitorPanel as SparkMonitorPanelComponent } from './components/SparkMonitorPanel';

const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  description: 'JupyterLab extension for Spark cluster monitoring',
  autoStart: true,
  optional: [ILayoutRestorer],
  activate: async (app: JupyterFrontEnd, restorer: ILayoutRestorer | null) => {
    // Gate on server extension enabling the feature
    if (PageConfig.getOption('sparkMonitorEnabled') !== 'true') {
      console.log(`${EXTENSION_ID}: disabled (sparkMonitorEnabled not set)`);
      return;
    }

    if (PageConfig.getOption('sparkMonitorMockMode') === 'true') {
      const { startMockServiceWorker } = await import('./mocks/start');
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

    const panel = new SparkMonitorLuminoPanel();
    panel.id = PANEL_ID;
    panel.title.icon = sparkMonitorIcon;
    panel.title.caption = 'Spark Monitor';

    const panelContent = ReactWidget.create(
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(SparkMonitorPanelComponent, {
          panelId: PANEL_ID,
          luminoPanel: panel
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

    app.commands.addCommand(COMMAND_OPEN_PANEL, {
      label: 'Spark Monitor',
      execute: () => {
        app.shell.activateById(PANEL_ID);
      }
    });
  }
};

export default plugin;
