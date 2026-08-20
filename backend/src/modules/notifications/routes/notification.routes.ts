import { Router, RequestHandler } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { validate } from '../../../middleware';
import { FindNotificationsSchema, NotificationIdParamSchema } from '../dto/notification.dto';

export function createNotificationsRouter(
  controller: NotificationController,
  authMiddleware: RequestHandler
): Router {
  const router = Router();

  // All notification endpoints require authenticated user session
  router.use(authMiddleware);

  // GET /api/v1/notifications
  router.get('/', validate({ query: FindNotificationsSchema }), controller.getNotifications);

  // GET /api/v1/notifications/unread-count
  router.get('/unread-count', controller.getUnreadCount);

  // PATCH /api/v1/notifications/read-all
  router.patch('/read-all', controller.markAllAsRead);

  // PATCH /api/v1/notifications/:id/read
  router.patch('/:id/read', validate({ params: NotificationIdParamSchema }), controller.markAsRead);

  return router;
}
