import { PrismaClient, TicketPriority, TicketStatus } from '@prisma/client';
import { AppError } from '../../../utils/appError';
import { NotificationService } from '../../notifications/services/notification.service';
import { NotificationRepository } from '../../notifications/repositories/notification.repository';

import { resolveDocumentPhysicalPath } from '../../documents/utils/document-file.util';

export class ClientPortalService {
  private readonly notificationService: NotificationService;

  constructor(
    private readonly prisma: PrismaClient,
    notificationService?: NotificationService
  ) {
    this.notificationService =
      notificationService ||
      new NotificationService(new NotificationRepository(prisma), prisma);
  }

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

    const [projectsCount, invoicesCount, invoicesSum, openTicketsCount, pipelines, milestones] = await Promise.all([
      this.prisma.project.count({ where: { clientId, deletedAt: null } }),
      this.prisma.invoice.count({ where: { clientId, deletedAt: null } }),
      this.prisma.invoice.aggregate({
        where: { clientId, status: 'PENDING', deletedAt: null },
        _sum: { amount: true },
      }),
      this.prisma.ticket.count({ where: { clientId, status: 'OPEN', deletedAt: null } }),
      this.prisma.dataPipeline.findMany({
        where: { clientId, deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      this.prisma.milestone.findMany({
        where: { project: { clientId }, deletedAt: null },
        include: { project: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const activePipelines = pipelines.map((pip) => ({
      id: pip.id,
      name: pip.name,
      status:
        pip.status === 'ACTIVE'
          ? 'Active'
          : pip.status === 'SYNCING'
          ? 'Syncing'
          : pip.status === 'STOPPED'
          ? 'Stopped'
          : pip.status === 'COMPLETED'
          ? 'Completed'
          : 'Failed',
      progress: pip.progress,
    }));

    const projectMilestones = milestones.map((ms) => ({
      id: ms.id,
      name: `${ms.project.name}: ${ms.title}`,
      description: ms.description || `Milestone objective for ${ms.project.name}`,
      status:
        ms.status === 'COMPLETED'
          ? 'Completed'
          : ms.status === 'IN_PROGRESS'
          ? 'In Progress'
          : ms.status === 'PENDING'
          ? 'Scheduled'
          : 'Delayed',
    }));

    return {
      systemStatus: 'Optimal',
      dataVolume: `${pipelines.length} Active Stream${pipelines.length === 1 ? '' : 's'}`,
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

    const absolutePath = await resolveDocumentPhysicalPath(document);

    return {
      document,
      absolutePath,
    };
  }

  public async getInvoicePdfForDownload(userId: string, userEmail: string, invoiceId: string) {
    const clientId = await this.getClientIdForUser(userId, userEmail);

    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, clientId, deletedAt: null },
      include: {
        client: { select: { id: true, name: true, code: true, email: true, phone: true, addressLine1: true, city: true, country: true } },
        project: { select: { id: true, name: true, code: true } },
        milestone: { select: { id: true, title: true, status: true, description: true } },
      },
    });

    if (!invoice) {
      throw new AppError('Invoice not found or access denied.', 404);
    }

    return invoice;
  }

  public async approveMilestone(userId: string, userEmail: string, milestoneId: string) {
    const clientId = await this.getClientIdForUser(userId, userEmail);

    const milestone = await this.prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        project: { clientId, deletedAt: null },
        deletedAt: null,
      },
      include: {
        project: { select: { id: true, name: true, clientId: true, projectManagerId: true } },
      },
    });

    if (!milestone) {
      throw new AppError('Milestone not found or access denied.', 404);
    }

    if (milestone.reviewStatus !== 'SUBMITTED') {
      throw new AppError('Milestone is not currently pending client review.', 400);
    }

    const updated = await this.prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        reviewStatus: 'APPROVED',
        approvedAt: new Date(),
        approvedById: userId,
        status: 'COMPLETED',
      },
    });

    try {
      await this.notificationService.notifyMilestoneApproved(updated, milestone.project);
    } catch (notificationError) {
      console.error('Failed to send milestone approval notification:', notificationError);
    }

    return updated;
  }

  public async requestMilestoneRevision(
    userId: string,
    userEmail: string,
    milestoneId: string,
    revisionNotes: string
  ) {
    if (!revisionNotes || !revisionNotes.trim() || revisionNotes.trim().length < 5) {
      throw new AppError('Revision notes feedback is required (minimum 5 characters).', 400);
    }

    const clientId = await this.getClientIdForUser(userId, userEmail);

    const milestone = await this.prisma.milestone.findFirst({
      where: {
        id: milestoneId,
        project: { clientId, deletedAt: null },
        deletedAt: null,
      },
      include: {
        project: { select: { id: true, name: true, clientId: true, projectManagerId: true } },
      },
    });

    if (!milestone) {
      throw new AppError('Milestone not found or access denied.', 404);
    }

    if (milestone.reviewStatus !== 'SUBMITTED') {
      throw new AppError('Milestone is not currently pending client review.', 400);
    }

    const updated = await this.prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        reviewStatus: 'REVISION_REQUESTED',
        revisionNotes: revisionNotes.trim(),
        status: 'IN_PROGRESS',
      },
    });

    try {
      await this.notificationService.notifyMilestoneRevisionRequested(
        updated,
        milestone.project,
        revisionNotes.trim()
      );
    } catch (notificationError) {
      console.error('Failed to send milestone revision request notification:', notificationError);
    }

    return updated;
  }
}
