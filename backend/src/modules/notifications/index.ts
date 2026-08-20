import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './controllers/notification.controller';
import { createNotificationsRouter } from './routes/notification.routes';

export { NotificationRepository, NotificationService, NotificationController };

export function createNotificationsModule(
  prisma: PrismaClient,
  authMiddleware: RequestHandler
): { router: Router; notificationService: NotificationService } {
  const repository = new NotificationRepository(prisma);
  const notificationService = new NotificationService(repository, prisma);
  const controller = new NotificationController(notificationService);
  const router = createNotificationsRouter(controller, authMiddleware);

  return {
    router,
    notificationService,
  };
}
