import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { FindNotificationsInput } from '../dto/notification.dto';

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  public getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const queryParams = req.query as unknown as FindNotificationsInput;
      const result = await this.notificationService.getUserNotifications(userId, queryParams);
      res.status(200).json({
        success: true,
        message: 'Notifications retrieved successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const unreadCount = await this.notificationService.getUnreadCount(userId);
      res.status(200).json({
        success: true,
        message: 'Unread notification count retrieved.',
        data: { unreadCount },
      });
    } catch (error) {
      next(error);
    }
  };

  public markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const notification = await this.notificationService.markAsRead(userId, id);
      res.status(200).json({
        success: true,
        message: 'Notification marked as read.',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  };

  public markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await this.notificationService.markAllAsRead(userId);
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
