import { apiClient } from './client';
import type { ApiResponse } from '../types/api';

export interface SystemInfoData {
  status: string;
  database: string;
  environment: string;
  uptimeSeconds: number;
  uptimeFormatted: string;
  timestamp: string;
}

export interface MetricCountsData {
  users: {
    total: number;
    active: number;
  };
  projects: {
    total: number;
    active: number;
  };
  tasks: {
    total: number;
    active: number;
    completed: number;
  };
  documents: {
    total: number;
  };
  invoices: {
    total: number;
    pending: number;
    paid: number;
  };
  clients: {
    total: number;
  };
  tickets: {
    total: number;
    open: number;
  };
  leads: {
    total: number;
  };
  auditLogs: {
    total: number;
  };
}

export interface SystemMetricsPayload {
  system: SystemInfoData;
  metrics: MetricCountsData;
}

export const systemMetricsApi = {
  getSystemMetrics: (): Promise<ApiResponse<SystemMetricsPayload>> =>
    apiClient.get<ApiResponse<SystemMetricsPayload>>('/system/metrics'),
};
