import { PrismaClient, Notification, NotificationType, Prisma } from '@prisma/client';
import { FindNotificationsInput } from '../dto/notification.dto';

export interface CreateNotificationInput {
  userId: string;
  type?: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
}

export interface PaginatedNotificationsOutput {
  items: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  pages: number;
}

export class NotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async create(data: CreateNotificationInput): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type || NotificationType.SYSTEM,
        title: data.title,
        message: data.message,
        entityType: data.entityType ?? null,
        entityId: data.entityId ?? null,
        metadata: data.metadata ?? Prisma.JsonNull,
      },
    });
  }

  public async createMany(dataList: CreateNotificationInput[]): Promise<number> {
    if (dataList.length === 0) return 0;
    const records = dataList.map((data) => ({
      userId: data.userId,
      type: data.type || NotificationType.SYSTEM,
      title: data.title,
      message: data.message,
      entityType: data.entityType ?? null,
      entityId: data.entityId ?? null,
      metadata: data.metadata ?? Prisma.JsonNull,
    }));

    const result = await this.prisma.notification.createMany({
      data: records,
    });
    return result.count;
  }

  public async findManyByUser(userId: string, options: FindNotificationsInput): Promise<PaginatedNotificationsOutput> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      userId,
      deletedAt: null,
    };

    if (options.isRead !== undefined) {
      where.isRead = options.isRead;
    }

    if (options.type) {
      where.type = options.type;
    }

    const [total, unreadCount, items] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false, deletedAt: null } }),
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items,
      total,
      unreadCount,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    };
  }

  public async countUnreadByUser(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
        deletedAt: null,
      },
    });
  }

  public async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findFirst({
      where: { id, deletedAt: null },
    });
  }

  public async markAsRead(id: string, userId: string): Promise<Notification | null> {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!notification) {
      return null;
    }

    if (notification.isRead) {
      return notification;
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  public async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
        deletedAt: null,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    return result.count;
  }
}
