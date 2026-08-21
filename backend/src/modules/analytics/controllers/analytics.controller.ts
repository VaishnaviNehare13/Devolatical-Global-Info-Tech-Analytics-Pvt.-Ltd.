import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { AnalyticsQueryInput, ReportExportQueryInput } from '../dto/analytics.dto';
import { PrismaClient } from '@prisma/client';

export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly prisma: PrismaClient
  ) {}

  /**
   * Helper function enforcing tenant isolation for Client Portal users.
   */
  private async applyTenantIsolationIfClient(req: Request, query: AnalyticsQueryInput): Promise<AnalyticsQueryInput> {
    const user = req.user;
    if (!user) return query;

    const roles = user.roles || [];
    const isClient = roles.some(
      (r) => typeof r === 'string' && (r.toUpperCase() === 'CLIENT' || r.toLowerCase().includes('client'))
    );

    if (isClient) {
      const client = await this.prisma.client.findFirst({
        where: {
          deletedAt: null,
          OR: [
            { accountManagerId: user.id },
            { createdById: user.id },
            { email: user.email },
          ],
        },
        select: { id: true },
      });

      if (client) {
        return {
          ...query,
          clientId: client.id,
        };
      }
    }

    return query;
  }

  public getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryParams = await this.applyTenantIsolationIfClient(req, req.query as unknown as AnalyticsQueryInput);
      const data = await this.analyticsService.getOverview(queryParams);
      res.status(200).json({
        success: true,
        message: 'Overview analytics retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public getLeads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryParams = await this.applyTenantIsolationIfClient(req, req.query as unknown as AnalyticsQueryInput);
      const data = await this.analyticsService.getLeadAnalytics(queryParams);
      res.status(200).json({
        success: true,
        message: 'Lead analytics retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public getFinancials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryParams = await this.applyTenantIsolationIfClient(req, req.query as unknown as AnalyticsQueryInput);
      const data = await this.analyticsService.getFinancialAnalytics(queryParams);
      res.status(200).json({
        success: true,
        message: 'Financial analytics retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public getTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryParams = await this.applyTenantIsolationIfClient(req, req.query as unknown as AnalyticsQueryInput);
      const data = await this.analyticsService.getTicketAnalytics(queryParams);
      res.status(200).json({
        success: true,
        message: 'Support ticket analytics retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryParams = await this.applyTenantIsolationIfClient(req, req.query as unknown as AnalyticsQueryInput);
      const data = await this.analyticsService.getProjectAnalytics(queryParams);
      res.status(200).json({
        success: true,
        message: 'Project analytics retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public getPipelines = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryParams = await this.applyTenantIsolationIfClient(req, req.query as unknown as AnalyticsQueryInput);
      const data = await this.analyticsService.getPipelineAnalytics(queryParams);
      res.status(200).json({
        success: true,
        message: 'Data pipeline analytics retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  // CSV Exports
  public exportLeadsCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryParams = await this.applyTenantIsolationIfClient(req, req.query as unknown as AnalyticsQueryInput);
      const { filename, csvString } = await this.analyticsService.exportLeadsCsv(queryParams);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csvString);
    } catch (error) {
      next(error);
    }
  };

  public exportInvoicesCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryParams = await this.applyTenantIsolationIfClient(req, req.query as unknown as AnalyticsQueryInput);
      const { filename, csvString } = await this.analyticsService.exportInvoicesCsv(queryParams);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csvString);
    } catch (error) {
      next(error);
    }
  };

  public exportTicketsCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryParams = await this.applyTenantIsolationIfClient(req, req.query as unknown as AnalyticsQueryInput);
      const { filename, csvString } = await this.analyticsService.exportTicketsCsv(queryParams);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csvString);
    } catch (error) {
      next(error);
    }
  };

  public exportProjectsCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryParams = await this.applyTenantIsolationIfClient(req, req.query as unknown as AnalyticsQueryInput);
      const { filename, csvString } = await this.analyticsService.exportProjectsCsv(queryParams);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csvString);
    } catch (error) {
      next(error);
    }
  };

  // PDF Report Export
  public exportReportPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryParams = await this.applyTenantIsolationIfClient(req, req.query as unknown as ReportExportQueryInput);
      const reportType = (queryParams as ReportExportQueryInput).report || 'overview';
      const { filename, pdfBuffer } = await this.analyticsService.exportReportPdf(reportType, queryParams);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  };
}
