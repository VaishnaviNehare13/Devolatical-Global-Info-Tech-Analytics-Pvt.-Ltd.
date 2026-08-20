import { z } from 'zod';

export const AnalyticsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  clientId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  status: z.string().optional(),
  source: z.string().optional(),
});

export const ReportExportQuerySchema = AnalyticsQuerySchema.extend({
  report: z.enum(['overview', 'leads', 'financials', 'tickets', 'projects', 'pipelines']).optional().default('overview'),
});

export type AnalyticsQueryInput = z.infer<typeof AnalyticsQuerySchema>;
export type ReportExportQueryInput = z.infer<typeof ReportExportQuerySchema>;
