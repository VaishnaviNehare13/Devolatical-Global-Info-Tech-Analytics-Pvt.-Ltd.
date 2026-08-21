import type { BaseQueryParams } from './api';

export type NotificationType =
  | 'SYSTEM'
  | 'TICKET'
  | 'INVOICE'
  | 'LEAD'
  | 'PROJECT'
  | 'MILESTONE'
  | 'DOCUMENT';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface UnreadCountPayload {
  unreadCount: number;
}

export interface MarkAllReadPayload {
  count: number;
}

export interface FindNotificationsQuery extends BaseQueryParams {
  isRead?: boolean;
  type?: NotificationType;
}
