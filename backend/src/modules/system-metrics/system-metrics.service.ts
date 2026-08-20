import { PrismaClient } from '@prisma/client';
import { config } from '../../config';
import { SystemMetricsResponseData } from './system-metrics.types';

export class SystemMetricsService {
  constructor(private readonly prisma: PrismaClient) {}

  public async getSystemMetrics(): Promise<SystemMetricsResponseData> {
    let dbStatus = 'connected';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'unreachable';
    }

    const [
      totalUsers,
      activeUsers,
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      activeTasks,
      totalDocuments,
      totalInvoices,
      pendingInvoices,
      paidInvoices,
      totalClients,
      totalTickets,
      openTickets,
      totalLeads,
      totalAuditLogs,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.project.count({ where: { deletedAt: null } }),
      this.prisma.project.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
      this.prisma.task.count({ where: { deletedAt: null } }),
      this.prisma.task.count({ where: { deletedAt: null, status: 'COMPLETED' } }),
      this.prisma.task.count({ where: { deletedAt: null, status: { notIn: ['COMPLETED'] } } }),
      this.prisma.document.count({ where: { deletedAt: null } }),
      this.prisma.invoice.count({ where: { deletedAt: null } }),
      this.prisma.invoice.count({
        where: { deletedAt: null, status: { in: ['PENDING', 'OVERDUE', 'DRAFT'] } },
      }),
      this.prisma.invoice.count({ where: { deletedAt: null, status: 'PAID' } }),
      this.prisma.client.count({ where: { deletedAt: null } }),
      this.prisma.ticket.count({ where: { deletedAt: null } }),
      this.prisma.ticket.count({ where: { deletedAt: null, status: 'OPEN' } }),
      this.prisma.lead.count({ where: { deletedAt: null } }),
      this.prisma.auditLog.count(),
    ]);

    const uptimeSeconds = Math.floor(process.uptime());
    const uptimeFormatted = this.formatUptime(uptimeSeconds);

    return {
      system: {
        status: dbStatus === 'connected' ? 'UP' : 'DEGRADED',
        database: dbStatus,
        environment: config.app.nodeEnv || 'development',
        uptimeSeconds,
        uptimeFormatted,
        timestamp: new Date().toISOString(),
      },
      metrics: {
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        projects: {
          total: totalProjects,
          active: activeProjects,
        },
        tasks: {
          total: totalTasks,
          active: activeTasks,
          completed: completedTasks,
        },
        documents: {
          total: totalDocuments,
        },
        invoices: {
          total: totalInvoices,
          pending: pendingInvoices,
          paid: paidInvoices,
        },
        clients: {
          total: totalClients,
        },
        tickets: {
          total: totalTickets,
          open: openTickets,
        },
        leads: {
          total: totalLeads,
        },
        auditLogs: {
          total: totalAuditLogs,
        },
      },
    };
  }

  private formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }
}
