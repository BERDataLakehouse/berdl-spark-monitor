import { http, HttpResponse } from 'msw';
import {
  mockClusterStatus,
  mockClusterSummary,
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
  })
];
