import request from 'supertest';
import express from 'express';
import { prisma } from '../../../config/db';
import { generateAccessToken } from '../../../shared/utils/jwt';
import { AuthMiddleware } from '../../../middleware/auth.middleware';
import { AuthRepository } from '../../auth/repositories/auth.repository';
import { createNotificationsModule } from '../index';
import { NotificationType } from '@prisma/client';
import { sendNotificationEmailSafe } from '../../../shared/utils/email';

describe('Notification Infrastructure Integration Tests', () => {
  let testApp: express.Application;

  let userAToken: string;
  let userBToken: string;

  let userAId: string;
  let userBId: string;

  let notifA1Id: string;
  let notifA2Id: string;
  let notifB1Id: string;

  beforeAll(async () => {
    // 1. Create Test Users
    const userA = await prisma.user.create({
      data: {
        firstName: 'Notif',
        lastName: 'UserA',
        displayName: 'Notif User A',
        email: `notif.user.a.${Date.now()}@example.com`,
        status: 'ACTIVE',
      },
    });
    userAId = userA.id;
    userAToken = generateAccessToken({ sub: userA.id, email: userA.email });

    const userB = await prisma.user.create({
      data: {
        firstName: 'Notif',
        lastName: 'UserB',
        displayName: 'Notif User B',
        email: `notif.user.b.${Date.now()}@example.com`,
        status: 'ACTIVE',
      },
    });
    userBId = userB.id;
    userBToken = generateAccessToken({ sub: userB.id, email: userB.email });

    // 2. Setup Test App
    testApp = express();
    testApp.use(express.json());

    const authRepository = new AuthRepository();
    const authMiddleware = new AuthMiddleware(authRepository);
    const { router: notificationsRouter } = createNotificationsModule(prisma, authMiddleware.handle);

    testApp.use('/api/v1/notifications', notificationsRouter);

    // 3. Seed Initial Notifications
    const notifA1 = await prisma.notification.create({
      data: {
        userId: userAId,
        type: NotificationType.TICKET,
        title: 'Ticket #101 Created',
        message: 'Your ticket has been created successfully.',
        isRead: false,
      },
    });
    notifA1Id = notifA1.id;

    const notifA2 = await prisma.notification.create({
      data: {
        userId: userAId,
        type: NotificationType.INVOICE,
        title: 'Invoice #INV-2026-001 Issued',
        message: 'Invoice has been issued.',
        isRead: false,
      },
    });
    notifA2Id = notifA2.id;

    const notifB1 = await prisma.notification.create({
      data: {
        userId: userBId,
        type: NotificationType.PROJECT,
        title: 'Project Assigned',
        message: 'You have been assigned to Project Beta.',
        isRead: false,
      },
    });
    notifB1Id = notifB1.id;
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({
      where: { userId: { in: [userAId, userBId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [userAId, userBId] } },
    });
  });

  describe('1. Authenticated User Notification Access & Tenant Isolation', () => {
    it('should retrieve notifications for authenticated User A (excluding User B notifications)', async () => {
      const res = await request(testApp)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(2);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.unreadCount).toBe(2);

      const ids = res.body.data.items.map((n: any) => n.id);
      expect(ids).toContain(notifA1Id);
      expect(ids).toContain(notifA2Id);
      expect(ids).not.toContain(notifB1Id);
    });

    it('should return 401 Unauthorized for unauthenticated notification requests', async () => {
      const res = await request(testApp).get('/api/v1/notifications');
      expect(res.status).toBe(401);
    });

    it('should calculate unread notification count accurately', async () => {
      const res = await request(testApp)
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.unreadCount).toBe(2);
    });
  });

  describe('2. Notification Read Status Operations & Security', () => {
    it('should allow User A to mark their own notification as read', async () => {
      const res = await request(testApp)
        .patch(`/api/v1/notifications/${notifA1Id}/read`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isRead).toBe(true);
      expect(res.body.data.readAt).not.toBeNull();

      // Verify unread count decremented
      const countRes = await request(testApp)
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${userAToken}`);
      expect(countRes.body.data.unreadCount).toBe(1);
    });

    it('should remain idempotent when marking an already-read notification as read', async () => {
      const res = await request(testApp)
        .patch(`/api/v1/notifications/${notifA1Id}/read`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isRead).toBe(true);
    });

    it('should DENY User B from marking User A notification as read with 404', async () => {
      const res = await request(testApp)
        .patch(`/api/v1/notifications/${notifA2Id}/read`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
    });

    it('should mark all unread notifications as read for User A', async () => {
      const res = await request(testApp)
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const countRes = await request(testApp)
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${userAToken}`);
      expect(countRes.body.data.unreadCount).toBe(0);
    });
  });

  describe('3. Event-Driven Notification Service Helpers & Email Dispatch Safety', () => {
    it('should generate notifications via NotificationService helpers and perform safe email dispatch', async () => {
      const { notificationService } = createNotificationsModule(prisma, (_req, _res, next) => next());

      await notificationService.notifyTicketCreated({
        id: 'test-ticket-id',
        subject: 'Database Timeout Issue',
        priority: 'HIGH',
        assignedToId: userAId,
      });

      const notifs = await prisma.notification.findMany({
        where: { userId: userAId, type: NotificationType.TICKET, entityId: 'test-ticket-id' },
      });

      expect(notifs.length).toBeGreaterThan(0);
      expect(notifs[0].title).toBe('New Support Ticket Created');
    });

    it('should handle non-blocking email errors gracefully without throwing exceptions', () => {
      expect(() => {
        sendNotificationEmailSafe({
          to: 'invalid-email-address',
          subject: 'Test Subject',
          title: 'Test Title',
          message: 'Test Message',
        });
      }).not.toThrow();
    });
  });
});
