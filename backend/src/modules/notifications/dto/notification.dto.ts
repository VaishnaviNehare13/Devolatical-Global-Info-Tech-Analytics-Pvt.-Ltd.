import { z } from 'zod';
import { NotificationType } from '@prisma/client';

export const NotificationIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid Notification ID format. Must be a valid UUID.' }),
});

export const FindNotificationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  isRead: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  type: z.nativeEnum(NotificationType).optional(),
});

export type FindNotificationsInput = z.infer<typeof FindNotificationsSchema>;
