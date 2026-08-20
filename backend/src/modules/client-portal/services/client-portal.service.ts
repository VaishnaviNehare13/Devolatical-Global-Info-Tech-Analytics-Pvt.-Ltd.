import path from 'path';
import fs from 'fs';
import { PrismaClient, TicketPriority, TicketStatus } from '@prisma/client';
import { AppError } from '../../../utils/appError';

export class ClientPortalService {
  constructor(private readonly prisma: PrismaClient) {}

  public async getClientIdForUser(userId: string, userEmail: string): Promise<string> {
    const client = await this.prisma.client.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { accountManagerId: userId },
          { createdById: userId },
          { email: userEmail },
        ],
      },
      select: { id: true },
    });

    if (!client) {
      throw new AppError('No client organization associated with this user account.', 403);
    }

    return client.id;
  }

  public async getOverview(userId: string, userEmail: string) {
    const clientId = await this.getClientIdForUser(userId, userEmail);

    const [projectsCount, invoicesCount, invoicesSum, openTicketsCount] = await Promise.all([
      this.prisma.project.count({ where: { clientId, deletedAt: null } }),
      this.prisma.invoice.count({ where: { clientId, deletedAt: null } }),
      this.prisma.invoice.aggregate({
        where: { clientId, status: 'PENDING', deletedAt: null },
        _sum: { amount: true },
      }),
      this.prisma.ticket.count({ where: { clientId, status: 'OPEN', deletedAt: null } }),
    ]);

    const activePipelines = [
      { id: 'pip-1', name: 'healthcare-telemetry-ingest', status: 'Active', progress: 85 },
      { id: 'pip-2', name: 'financial-ledger-sync', status: 'Active', progress: 94 },
      { id: 'pip-3', name: 'retail-recommender-update', status: 'Syncing', progress: 34 },
    ];

    const projectMilestones = [
      { id: 'ms-1', name: 'Phase 3: Security Hardening', description: 'Integration of IAM protocols and OAuth 2.0 gates.', status: 'In Progress' },
      { id: 'ms-2', name: 'Phase 2: Spark Cluster Setup', description: 'Deployment of PySpark analytics compute cluster.', status: 'Completed' },
      { id: 'ms-3', name: 'Phase 4: BI Dashboards Rollout', description: 'Provisioning Metabase templates and metrics.', status: 'Scheduled' },
    ];

    return {
      systemStatus: 'Optimal',
      dataVolume: 'High Volume',
      activeProjectsCount: projectsCount,
      totalInvoicesCount: invoicesCount,
      pendingInvoiceTotal: invoicesSum._sum.amount ? Number(invoicesSum._sum.amount) : 0,
      openTicketsCount,
      activePipelines,
      projectMilestones,
    };
  }

  public async getProjects(userId: string, userEmail: string) {
    const clientId = await this.getClientIdForUser(userId, userEmail);

    const projects = await this.prisma.project.findMany({
      where: { clientId, deletedAt: null },
      include: {
        client: { select: { id: true, name: true, code: true } },
        milestones: { where: { deletedAt: null } },
        tasks: { where: { deletedAt: null }, take: 10 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects;
  }

  public async getInvoices(userId: string, userEmail: string) {
    const clientId = await this.getClientIdForUser(userId, userEmail);

    const invoices = await this.prisma.invoice.findMany({
      where: { clientId, deletedAt: null },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invoices;
  }

  public async getTickets(userId: string, userEmail: string) {
    const clientId = await this.getClientIdForUser(userId, userEmail);

    const tickets = await this.prisma.ticket.findMany({
      where: { clientId, deletedAt: null },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tickets;
  }

  public async createTicket(
    userId: string,
    userEmail: string,
    data: { subject: string; description: string; priority?: string; projectId?: string }
  ) {
    const clientId = await this.getClientIdForUser(userId, userEmail);

    if (data.projectId) {
      const projectObj = await this.prisma.project.findFirst({
        where: { id: data.projectId, clientId, deletedAt: null },
      });
      if (!projectObj) {
        throw new AppError('Specified project does not belong to your client organization.', 400);
      }
    }

    let mappedPriority: TicketPriority = TicketPriority.MEDIUM;
    if (data.priority?.toUpperCase() === 'HIGH') mappedPriority = TicketPriority.HIGH;
    if (data.priority?.toUpperCase() === 'CRITICAL') mappedPriority = TicketPriority.CRITICAL;
    if (data.priority?.toUpperCase() === 'LOW') mappedPriority = TicketPriority.LOW;

    const newTicket = await this.prisma.ticket.create({
      data: {
        subject: data.subject,
        description: data.description,
        priority: mappedPriority,
        status: TicketStatus.OPEN,
        clientId: clientId,
        projectId: data.projectId || null,
        createdById: userId,
      },
      include: {
        project: { select: { id: true, name: true } },
      },
    });

    return newTicket;
  }

  public async getTicketById(userId: string, userEmail: string, ticketId: string) {
    const clientId = await this.getClientIdForUser(userId, userEmail);

    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, clientId, deletedAt: null },
      include: {
        project: { select: { id: true, name: true, code: true } },
        comments: {
          where: { deletedAt: null, isInternal: false },
          include: {
            user: { select: { id: true, displayName: true, email: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new AppError('Ticket not found or access denied.', 404);
    }

    return ticket;
  }

  public async addTicketComment(
    userId: string,
    userEmail: string,
    ticketId: string,
    message: string
  ) {
    const clientId = await this.getClientIdForUser(userId, userEmail);

    const ticket = await this.prisma.ticket.findFirst({
      where: { id: ticketId, clientId, deletedAt: null },
    });

    if (!ticket) {
      throw new AppError('Ticket not found or access denied.', 404);
    }

    if (!message || !message.trim()) {
      throw new AppError('Comment message cannot be empty.', 400);
    }

    const comment = await this.prisma.ticketComment.create({
      data: {
        ticketId,
        userId,
        message: message.trim(),
        isInternal: false,
      },
      include: {
        user: { select: { id: true, displayName: true, email: true } },
      },
    });

    return comment;
  }

  public async getDocuments(userId: string, userEmail: string) {
    const clientId = await this.getClientIdForUser(userId, userEmail);

    const documents = await this.prisma.document.findMany({
      where: {
        deletedAt: null,
        OR: [
          { clientId },
          { project: { clientId } },
        ],
      },
      include: {
        client: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return documents;
  }

  public async getDocumentForDownload(userId: string, userEmail: string, documentId: string) {
    const clientId = await this.getClientIdForUser(userId, userEmail);

    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        deletedAt: null,
        OR: [
          { clientId },
          { project: { clientId } },
        ],
      },
    });

    if (!document) {
      throw new AppError('Document not found or access denied.', 404);
    }

    const absolutePath = path.isAbsolute(document.fileUrl)
      ? document.fileUrl
      : path.resolve(process.cwd(), document.fileUrl);

    if (!fs.existsSync(absolutePath)) {
      throw new AppError('Physical document file not found on server disk.', 404);
    }

    return {
      document,
      absolutePath,
    };
  }
}
