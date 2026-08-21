import { NotificationRepository, CreateNotificationInput, PaginatedNotificationsOutput } from '../repositories/notification.repository';
import { FindNotificationsInput } from '../dto/notification.dto';
import { Notification, NotificationType, PrismaClient } from '@prisma/client';
import { sendNotificationEmailSafe } from '../../../shared/utils/email';
import { AppError } from '../../../utils/appError';

export interface DispatchNotificationOptions extends CreateNotificationInput {
  sendEmail?: boolean;
  recipientEmail?: string;
  emailSubject?: string;
  actionUrl?: string;
}

export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly prisma: PrismaClient
  ) {}

  /**
   * Creates an in-app notification and optionally dispatches a non-blocking notification email.
   */
  public async createNotification(options: DispatchNotificationOptions): Promise<Notification> {
    const notification = await this.notificationRepository.create(options);

    if (options.sendEmail !== false) {
      this.dispatchEmailSafely(options.userId, options.recipientEmail, options.emailSubject || options.title, options.title, options.message, options.actionUrl);
    }

    return notification;
  }

  /**
   * Bulk notification creation for multiple recipient user IDs.
   */
  public async createNotifications(userIds: string[], options: Omit<DispatchNotificationOptions, 'userId'>): Promise<number> {
    if (userIds.length === 0) return 0;
    const uniqueUserIds = Array.from(new Set(userIds));

    const records: CreateNotificationInput[] = uniqueUserIds.map((userId) => ({
      userId,
      type: options.type,
      title: options.title,
      message: options.message,
      entityType: options.entityType,
      entityId: options.entityId,
      metadata: options.metadata,
    }));

    const count = await this.notificationRepository.createMany(records);

    if (options.sendEmail !== false) {
      // Non-blocking background email dispatch for recipients
      this.dispatchBulkEmailsSafely(uniqueUserIds, options.emailSubject || options.title, options.title, options.message, options.actionUrl);
    }

    return count;
  }

  public async getUserNotifications(userId: string, options: FindNotificationsInput): Promise<PaginatedNotificationsOutput> {
    return this.notificationRepository.findManyByUser(userId, options);
  }

  public async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.countUnreadByUser(userId);
  }

  public async markAsRead(userId: string, notificationId: string): Promise<Notification> {
    const updated = await this.notificationRepository.markAsRead(notificationId, userId);
    if (!updated) {
      throw new AppError('Notification not found or access denied.', 404);
    }
    return updated;
  }

  public async markAllAsRead(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.markAllAsRead(userId);
    return { count };
  }

  // Business Event Notification Handlers

  public async notifyTicketCreated(ticket: any): Promise<void> {
    const recipients = new Set<string>();
    if (ticket.assignedToId) recipients.add(ticket.assignedToId);

    const adminRoles = await this.prisma.userRole.findMany({
      where: {
        role: { code: { in: ['SUPER_ADMIN', 'ADMIN'] } },
        user: { status: 'ACTIVE' },
      },
      select: { userId: true },
    });
    adminRoles.forEach((ur) => recipients.add(ur.userId));

    await this.createNotifications(Array.from(recipients), {
      type: NotificationType.TICKET,
      title: 'New Support Ticket Created',
      message: `Support Ticket "${ticket.subject}" has been created with priority ${ticket.priority}.`,
      entityType: 'Ticket',
      entityId: ticket.id,
      emailSubject: `[Ticket Created] ${ticket.subject}`,
    });
  }

  public async notifyTicketComment(ticket: any, comment: any): Promise<void> {
    const recipients = new Set<string>();

    if (comment.isInternal) {
      if (ticket.assignedToId && ticket.assignedToId !== comment.userId) {
        recipients.add(ticket.assignedToId);
      }
      const adminRoles = await this.prisma.userRole.findMany({
        where: {
          role: { code: { in: ['SUPER_ADMIN', 'ADMIN'] } },
          user: { status: 'ACTIVE', id: { not: comment.userId } },
        },
        select: { userId: true },
      });
      adminRoles.forEach((ur) => recipients.add(ur.userId));

      await this.createNotifications(Array.from(recipients), {
        type: NotificationType.TICKET,
        title: 'Internal Ticket Note',
        message: `An internal note was added to Ticket "${ticket.subject}".`,
        entityType: 'Ticket',
        entityId: ticket.id,
        emailSubject: `[Internal Note] Ticket: ${ticket.subject}`,
      });
    } else {
      if (ticket.createdById && ticket.createdById !== comment.userId) {
        recipients.add(ticket.createdById);
      }
      if (ticket.assignedToId && ticket.assignedToId !== comment.userId) {
        recipients.add(ticket.assignedToId);
      }

      await this.createNotifications(Array.from(recipients), {
        type: NotificationType.TICKET,
        title: 'New Ticket Reply',
        message: `A reply was added to Ticket "${ticket.subject}".`,
        entityType: 'Ticket',
        entityId: ticket.id,
        emailSubject: `[Ticket Reply] ${ticket.subject}`,
      });
    }
  }

  public async notifyTicketUpdated(ticket: any): Promise<void> {
    const recipients = new Set<string>();
    if (ticket.createdById) recipients.add(ticket.createdById);
    if (ticket.assignedToId) recipients.add(ticket.assignedToId);

    await this.createNotifications(Array.from(recipients), {
      type: NotificationType.TICKET,
      title: 'Ticket Status Updated',
      message: `Ticket "${ticket.subject}" status is now ${ticket.status}.`,
      entityType: 'Ticket',
      entityId: ticket.id,
      emailSubject: `[Ticket Update] ${ticket.subject}`,
    });
  }

  public async notifyInvoiceCreated(invoice: any): Promise<void> {
    const recipients = new Set<string>();
    if (invoice.clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: invoice.clientId },
        select: { accountManagerId: true, createdById: true },
      });
      if (client?.accountManagerId) recipients.add(client.accountManagerId);
      if (client?.createdById) recipients.add(client.createdById);
    }

    await this.createNotifications(Array.from(recipients), {
      type: NotificationType.INVOICE,
      title: 'New Invoice Issued',
      message: `Invoice #${invoice.invoiceNumber} has been issued for ${invoice.currency} ${invoice.amount}.`,
      entityType: 'Invoice',
      entityId: invoice.id,
      emailSubject: `[Invoice Issued] #${invoice.invoiceNumber}`,
    });
  }

  public async notifyInvoiceUpdated(invoice: any): Promise<void> {
    const recipients = new Set<string>();
    if (invoice.clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: invoice.clientId },
        select: { accountManagerId: true, createdById: true },
      });
      if (client?.accountManagerId) recipients.add(client.accountManagerId);
      if (client?.createdById) recipients.add(client.createdById);
    }

    await this.createNotifications(Array.from(recipients), {
      type: NotificationType.INVOICE,
      title: 'Invoice Status Updated',
      message: `Invoice #${invoice.invoiceNumber} status has been updated to ${invoice.status}.`,
      entityType: 'Invoice',
      entityId: invoice.id,
      emailSubject: `[Invoice Update] #${invoice.invoiceNumber}`,
    });
  }

  public async notifyMilestoneUpdated(milestone: any): Promise<void> {
    const recipients = new Set<string>();
    if (milestone.createdById) recipients.add(milestone.createdById);

    await this.createNotifications(Array.from(recipients), {
      type: NotificationType.MILESTONE,
      title: 'Milestone Updated',
      message: `Milestone "${milestone.title}" status is now ${milestone.status}.`,
      entityType: 'Milestone',
      entityId: milestone.id,
      emailSubject: `[Milestone Update] ${milestone.title}`,
    });
  }

  public async notifyMilestoneSubmittedForReview(milestone: any, project: any): Promise<void> {
    const recipients = new Set<string>();
    if (project.clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: project.clientId },
        select: { accountManagerId: true, createdById: true },
      });
      if (client?.accountManagerId) recipients.add(client.accountManagerId);
      if (client?.createdById) recipients.add(client.createdById);
    }

    await this.createNotifications(Array.from(recipients), {
      type: NotificationType.MILESTONE,
      title: 'Milestone Ready for Review',
      message: `Milestone "${milestone.title}" for project "${project.name}" has been submitted for deliverable review.`,
      entityType: 'Milestone',
      entityId: milestone.id,
      emailSubject: `[Milestone Review] ${milestone.title}`,
    });
  }

  public async notifyMilestoneApproved(milestone: any, project: any): Promise<void> {
    const recipients = new Set<string>();
    if (milestone.createdById) recipients.add(milestone.createdById);
    if (project.projectManagerId) recipients.add(project.projectManagerId);

    const adminRoles = await this.prisma.userRole.findMany({
      where: {
        role: { code: { in: ['SUPER_ADMIN', 'ADMIN'] } },
        user: { status: 'ACTIVE' },
      },
      select: { userId: true },
    });
    adminRoles.forEach((ur) => recipients.add(ur.userId));

    await this.createNotifications(Array.from(recipients), {
      type: NotificationType.MILESTONE,
      title: 'Milestone Approved by Client',
      message: `Client approved milestone "${milestone.title}" for project "${project.name}".`,
      entityType: 'Milestone',
      entityId: milestone.id,
      emailSubject: `[Milestone Approved] ${milestone.title}`,
    });
  }

  public async notifyMilestoneRevisionRequested(milestone: any, project: any, notes: string): Promise<void> {
    const recipients = new Set<string>();
    if (milestone.createdById) recipients.add(milestone.createdById);
    if (project.projectManagerId) recipients.add(project.projectManagerId);

    const adminRoles = await this.prisma.userRole.findMany({
      where: {
        role: { code: { in: ['SUPER_ADMIN', 'ADMIN'] } },
        user: { status: 'ACTIVE' },
      },
      select: { userId: true },
    });
    adminRoles.forEach((ur) => recipients.add(ur.userId));

    await this.createNotifications(Array.from(recipients), {
      type: NotificationType.MILESTONE,
      title: 'Milestone Revision Requested',
      message: `Client requested revision on milestone "${milestone.title}". Feedback: ${notes}`,
      entityType: 'Milestone',
      entityId: milestone.id,
      emailSubject: `[Milestone Revision] ${milestone.title}`,
    });
  }

  public async notifyLeadUpdated(lead: any): Promise<void> {
    const recipients = new Set<string>();
    if (lead.assignedToId) recipients.add(lead.assignedToId);

    const adminRoles = await this.prisma.userRole.findMany({
      where: {
        role: { code: { in: ['SUPER_ADMIN', 'ADMIN'] } },
        user: { status: 'ACTIVE' },
      },
      select: { userId: true },
    });
    adminRoles.forEach((ur) => recipients.add(ur.userId));

    await this.createNotifications(Array.from(recipients), {
      type: NotificationType.LEAD,
      title: 'Lead Status Update',
      message: `Lead "${lead.name}" status has been updated to ${lead.status}.`,
      entityType: 'Lead',
      entityId: lead.id,
      emailSubject: `[Lead Update] ${lead.name}`,
    });
  }

  public async notifyDocumentUploaded(document: any): Promise<void> {
    const recipients = new Set<string>();
    if (document.createdById) recipients.add(document.createdById);
    if (document.clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: document.clientId },
        select: { accountManagerId: true },
      });
      if (client?.accountManagerId) recipients.add(client.accountManagerId);
    }

    await this.createNotifications(Array.from(recipients), {
      type: NotificationType.DOCUMENT,
      title: 'New Document Uploaded',
      message: `Document "${document.title}" (${document.fileName}) has been uploaded.`,
      entityType: 'Document',
      entityId: document.id,
      emailSubject: `[Document Uploaded] ${document.title}`,
    });
  }

  private dispatchEmailSafely(
    userId: string,
    recipientEmail?: string,
    subject?: string,
    title?: string,
    message?: string,
    actionUrl?: string
  ): void {
    Promise.resolve().then(async () => {
      try {
        let email = recipientEmail;
        if (!email) {
          const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, status: true },
          });
          if (user && user.status === 'ACTIVE') {
            email = user.email;
          }
        }
        if (email && subject && title && message) {
          sendNotificationEmailSafe({
            to: email,
            subject,
            title,
            message,
            actionUrl,
          });
        }
      } catch (err) {
        console.error(`[NOTIFICATION SERVICE] Failed to dispatch email to user ${userId}:`, err);
      }
    });
  }

  private dispatchBulkEmailsSafely(
    userIds: string[],
    subject?: string,
    title?: string,
    message?: string,
    actionUrl?: string
  ): void {
    Promise.resolve().then(async () => {
      try {
        const users = await this.prisma.user.findMany({
          where: {
            id: { in: userIds },
            status: 'ACTIVE',
            deletedAt: null,
          },
          select: { email: true },
        });

        for (const user of users) {
          if (user.email && subject && title && message) {
            sendNotificationEmailSafe({
              to: user.email,
              subject,
              title,
              message,
              actionUrl,
            });
          }
        }
      } catch (err) {
        console.error('[NOTIFICATION SERVICE] Failed to bulk dispatch email notifications:', err);
      }
    });
  }
}
