import { PrismaClient, Prisma } from '@prisma/client';
import { AnalyticsQueryInput } from '../dto/analytics.dto';

export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async getLeadAnalytics(filters: AnalyticsQueryInput) {
    const where: Prisma.LeadWhereInput = { deletedAt: null };

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }
    if (filters.status) {
      where.status = filters.status as any;
    }
    if (filters.source) {
      where.source = filters.source as any;
    }

    const [total, byStatusRaw, bySourceRaw, wonCount] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
      this.prisma.lead.groupBy({
        by: ['source'],
        where,
        _count: { id: true },
      }),
      this.prisma.lead.count({ where: { ...where, status: 'WON' } }),
    ]);

    const byStatus: Record<string, number> = {};
    byStatusRaw.forEach((item) => {
      byStatus[item.status] = item._count.id;
    });

    const bySource: Record<string, number> = {};
    bySourceRaw.forEach((item) => {
      const sourceKey = item.source || 'UNKNOWN';
      bySource[sourceKey] = item._count.id;
    });

    const conversionRate = total > 0 ? Number(((wonCount / total) * 100).toFixed(2)) : 0;

    return {
      totalLeads: total,
      wonLeads: wonCount,
      conversionRate,
      leadsByStatus: byStatus,
      leadsBySource: bySource,
    };
  }

  public async getFinancialAnalytics(filters: AnalyticsQueryInput) {
    const where: Prisma.InvoiceWhereInput = { deletedAt: null };

    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.projectId) where.projectId = filters.projectId;

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [total, byStatusRaw, sumTotal, sumPaid, sumPending, sumOverdue] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
        _sum: { amount: true },
      }),
      this.prisma.invoice.aggregate({ where, _sum: { amount: true } }),
      this.prisma.invoice.aggregate({ where: { ...where, status: 'PAID' }, _sum: { amount: true } }),
      this.prisma.invoice.aggregate({ where: { ...where, status: 'PENDING' }, _sum: { amount: true } }),
      this.prisma.invoice.aggregate({ where: { ...where, status: 'OVERDUE' }, _sum: { amount: true } }),
    ]);

    const invoicesByStatus: Record<string, { count: number; totalAmount: number }> = {};
    byStatusRaw.forEach((item) => {
      invoicesByStatus[item.status] = {
        count: item._count.id,
        totalAmount: item._sum.amount ? Number(item._sum.amount) : 0,
      };
    });

    return {
      totalInvoices: total,
      totalInvoicedAmount: sumTotal._sum.amount ? Number(sumTotal._sum.amount) : 0,
      paidAmount: sumPaid._sum.amount ? Number(sumPaid._sum.amount) : 0,
      pendingAmount: sumPending._sum.amount ? Number(sumPending._sum.amount) : 0,
      overdueAmount: sumOverdue._sum.amount ? Number(sumOverdue._sum.amount) : 0,
      invoicesByStatus,
    };
  }

  public async getTicketAnalytics(filters: AnalyticsQueryInput) {
    const where: Prisma.TicketWhereInput = { deletedAt: null };

    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.projectId) where.projectId = filters.projectId;

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [total, openCount, resolvedCount, closedCount, byPriorityRaw, byStatusRaw] = await Promise.all([
      this.prisma.ticket.count({ where }),
      this.prisma.ticket.count({ where: { ...where, status: 'OPEN' } }),
      this.prisma.ticket.count({ where: { ...where, status: 'RESOLVED' } }),
      this.prisma.ticket.count({ where: { ...where, status: 'CLOSED' } }),
      this.prisma.ticket.groupBy({
        by: ['priority'],
        where,
        _count: { id: true },
      }),
      this.prisma.ticket.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
    ]);

    const ticketsByPriority: Record<string, number> = {};
    byPriorityRaw.forEach((item) => {
      ticketsByPriority[item.priority] = item._count.id;
    });

    const ticketsByStatus: Record<string, number> = {};
    byStatusRaw.forEach((item) => {
      ticketsByStatus[item.status] = item._count.id;
    });

    const completedTotal = resolvedCount + closedCount;
    const resolutionRate = total > 0 ? Number(((completedTotal / total) * 100).toFixed(2)) : 0;

    return {
      totalTickets: total,
      openTickets: openCount,
      resolvedTickets: resolvedCount,
      closedTickets: closedCount,
      resolutionRate,
      ticketsByPriority,
      ticketsByStatus,
    };
  }

  public async getProjectAnalytics(filters: AnalyticsQueryInput) {
    const where: Prisma.ProjectWhereInput = { deletedAt: null };

    if (filters.clientId) where.clientId = filters.clientId;

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const milestoneWhere: Prisma.MilestoneWhereInput = { deletedAt: null };
    if (filters.clientId) {
      milestoneWhere.project = { clientId: filters.clientId };
    }

    const [total, activeCount, completedCount, byStatusRaw, totalMilestones, completedMilestones] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.count({ where: { ...where, status: 'ACTIVE' } }),
      this.prisma.project.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.project.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
      this.prisma.milestone.count({ where: milestoneWhere }),
      this.prisma.milestone.count({ where: { ...milestoneWhere, status: 'COMPLETED' } }),
    ]);

    const projectsByStatus: Record<string, number> = {};
    byStatusRaw.forEach((item) => {
      projectsByStatus[item.status] = item._count.id;
    });

    const milestoneCompletionRate =
      totalMilestones > 0 ? Number(((completedMilestones / totalMilestones) * 100).toFixed(2)) : 0;

    return {
      totalProjects: total,
      activeProjects: activeCount,
      completedProjects: completedCount,
      projectsByStatus,
      totalMilestones,
      completedMilestones,
      milestoneCompletionRate,
    };
  }

  public async getPipelineAnalytics(filters: AnalyticsQueryInput) {
    const where: Prisma.DataPipelineWhereInput = { deletedAt: null };

    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.projectId) where.projectId = filters.projectId;

    const [total, active, syncing, stopped, completed, failed, aggregateProgress] = await Promise.all([
      this.prisma.dataPipeline.count({ where }),
      this.prisma.dataPipeline.count({ where: { ...where, status: 'ACTIVE' } }),
      this.prisma.dataPipeline.count({ where: { ...where, status: 'SYNCING' } }),
      this.prisma.dataPipeline.count({ where: { ...where, status: 'STOPPED' } }),
      this.prisma.dataPipeline.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.dataPipeline.count({ where: { ...where, status: 'FAILED' } }),
      this.prisma.dataPipeline.aggregate({
        where,
        _avg: { progress: true },
      }),
    ]);

    return {
      totalPipelines: total,
      activePipelines: active,
      syncingPipelines: syncing,
      stoppedPipelines: stopped,
      completedPipelines: completed,
      failedPipelines: failed,
      averageProgress: Math.round(aggregateProgress._avg.progress || 0),
    };
  }

  // Export Data Queries
  public async getRawLeadsForExport(filters: AnalyticsQueryInput) {
    const where: Prisma.LeadWhereInput = { deletedAt: null };
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }
    if (filters.status) where.status = filters.status as any;
    if (filters.source) where.source = filters.source as any;

    return this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });
  }

  public async getRawInvoicesForExport(filters: AnalyticsQueryInput) {
    const where: Prisma.InvoiceWhereInput = { deletedAt: null };
    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    return this.prisma.invoice.findMany({
      where,
      include: {
        client: { select: { name: true, code: true } },
        project: { select: { name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });
  }

  public async getRawTicketsForExport(filters: AnalyticsQueryInput) {
    const where: Prisma.TicketWhereInput = { deletedAt: null };
    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    return this.prisma.ticket.findMany({
      where,
      include: {
        client: { select: { name: true } },
        project: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });
  }

  public async getRawProjectsForExport(filters: AnalyticsQueryInput) {
    const where: Prisma.ProjectWhereInput = { deletedAt: null };
    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    return this.prisma.project.findMany({
      where,
      include: {
        client: { select: { name: true, code: true } },
        milestones: { select: { title: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });
  }
}
