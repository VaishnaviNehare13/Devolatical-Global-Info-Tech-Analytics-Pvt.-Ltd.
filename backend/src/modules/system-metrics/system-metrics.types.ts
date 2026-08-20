export interface SystemInfoOutput {
  status: string;
  database: string;
  environment: string;
  uptimeSeconds: number;
  uptimeFormatted: string;
  timestamp: string;
}

export interface MetricCountsOutput {
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

export interface SystemMetricsResponseData {
  system: SystemInfoOutput;
  metrics: MetricCountsOutput;
}
