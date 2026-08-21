import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import type {
  Notification,
  UnreadCountPayload,
  MarkAllReadPayload,
  FindNotificationsQuery,
} from '../types/notification';

/**
 * Notifications API Service Module.
 * Communicates with backend /api/v1/notifications endpoints.
 */
export const notificationsApi = {
  /**
   * List, filter, and paginate user-scoped notifications.
   * GET /api/v1/notifications
   */
  getNotifications: (
    params?: FindNotificationsQuery
  ): Promise<PaginatedResponse<Notification>> =>
    apiClient.get<PaginatedResponse<Notification>>('/notifications', { params }),

  /**
   * Get total unread count for authenticated user session.
   * GET /api/v1/notifications/unread-count
   */
  getUnreadCount: (): Promise<ApiResponse<UnreadCountPayload>> =>
    apiClient.get<ApiResponse<UnreadCountPayload>>('/notifications/unread-count'),

  /**
   * Mark a single notification as read.
   * PATCH /api/v1/notifications/:id/read
   */
  markAsRead: (id: string): Promise<ApiResponse<Notification>> =>
    apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`),

  /**
   * Mark all unread notifications as read.
   * PATCH /api/v1/notifications/read-all
   */
  markAllAsRead: (): Promise<ApiResponse<MarkAllReadPayload>> =>
    apiClient.patch<ApiResponse<MarkAllReadPayload>>('/notifications/read-all'),
};
