import { http, HttpResponse } from 'msw';
import {
  mockClusterStatus,
  mockClusterSummary,
  mockClusterCreateResponse,
  mockExecutors,
  mockStages
} from './mockData';

export const handlers = [
  http.get('*/berdl/api/spark-monitor/status', () => {
    return HttpResponse.json(mockClusterStatus);
  }),

  http.get('*/berdl/api/spark-monitor/cluster', () => {
    return HttpResponse.json(mockClusterSummary);
  }),

  http.get('*/berdl/api/spark-monitor/app/executors', () => {
    return HttpResponse.json(mockExecutors);
  }),

  http.get('*/berdl/api/spark-monitor/app/stages', () => {
    return HttpResponse.json(mockStages);
  }),

  http.post('*/berdl/api/spark-monitor/cluster/create', async () => {
    await new Promise(r => setTimeout(r, 1500));
    return HttpResponse.json(mockClusterCreateResponse);
  }),

  http.delete('*/berdl/api/spark-monitor/cluster/delete', async () => {
    await new Promise(r => setTimeout(r, 1000));
    return HttpResponse.json({ message: 'Cluster deleted' });
  })
];
