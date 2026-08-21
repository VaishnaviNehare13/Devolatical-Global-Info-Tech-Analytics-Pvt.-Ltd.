import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/db';
import { generateAccessToken } from '../../../shared/utils/jwt';
import { SYSTEM_ROLES } from '../../../shared/constants/roles';

describe('Support Helpdesk & Ticket Conversation Integration Tests', () => {
  let adminToken: string;
  let clientAToken: string;
  let clientBToken: string;

  let adminUserId: string;
  let clientAUserId: string;
  let clientBUserId: string;

  let clientAOrgId: string;
  let clientBOrgId: string;

  let ticketAId: string;
  let ticketBId: string;

  beforeAll(async () => {
    // 1. Ensure Roles matching SYSTEM_ROLES
    let adminRole = await prisma.role.findFirst({
      where: { OR: [{ code: 'ADMIN' }, { name: SYSTEM_ROLES.ADMIN }] },
    });
    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: { name: SYSTEM_ROLES.ADMIN, code: 'ADMIN', isSystem: true },
      });
    }

    let clientRole = await prisma.role.findFirst({
      where: { OR: [{ code: 'CLIENT' }, { name: SYSTEM_ROLES.CLIENT }] },
    });
    if (!clientRole) {
      clientRole = await prisma.role.create({
        data: { name: SYSTEM_ROLES.CLIENT, code: 'CLIENT', isSystem: true },
      });
    }

    if (adminRole.name !== SYSTEM_ROLES.ADMIN) {
      adminRole = await prisma.role.update({
        where: { id: adminRole.id },
        data: { name: SYSTEM_ROLES.ADMIN },
      });
    }

    // 2. Create Users
    const adminUser = await prisma.user.create({
      data: {
        email: 'ticket_admin_test@example.com',
        firstName: 'TicketAdmin',
        lastName: 'User',
        displayName: 'TicketAdmin User',
      },
    });
    adminUserId = adminUser.id;
    await prisma.userRole.create({ data: { userId: adminUserId, roleId: adminRole.id } });

    const clientAUser = await prisma.user.create({
      data: {
        email: 'ticket_clientA_test@example.com',
        firstName: 'TicketClientA',
        lastName: 'User',
        displayName: 'TicketClientA User',
      },
    });
    clientAUserId = clientAUser.id;
    await prisma.userRole.create({ data: { userId: clientAUserId, roleId: clientRole.id } });

    const clientBUser = await prisma.user.create({
      data: {
        email: 'ticket_clientB_test@example.com',
        firstName: 'TicketClientB',
        lastName: 'User',
        displayName: 'TicketClientB User',
      },
    });
    clientBUserId = clientBUser.id;
    await prisma.userRole.create({ data: { userId: clientBUserId, roleId: clientRole.id } });

    // 3. Create Client Organizations
    const clientAOrg = await prisma.client.create({
      data: {
        name: 'Ticket Client Org A',
        code: 'CLT-TKT-A',
        email: 'ticket_clientA_test@example.com',
        accountManagerId: clientAUserId,
      },
    });
    clientAOrgId = clientAOrg.id;

    const clientBOrg = await prisma.client.create({
      data: {
        name: 'Ticket Client Org B',
        code: 'CLT-TKT-B',
        email: 'ticket_clientB_test@example.com',
        accountManagerId: clientBUserId,
      },
    });
    clientBOrgId = clientBOrg.id;

    // 4. Create Tickets
    const ticketA = await prisma.ticket.create({
      data: {
        subject: 'Database Connection Issue',
        description: 'Unable to connect to primary DB cluster',
        status: 'OPEN',
        priority: 'HIGH',
        category: 'TECHNICAL',
        clientId: clientAOrgId,
        createdById: clientAUserId,
      },
    });
    ticketAId = ticketA.id;

    const ticketB = await prisma.ticket.create({
      data: {
        subject: 'Billing Inquiry for June',
        description: 'Invoice #1002 amounts look incorrect',
        status: 'OPEN',
        priority: 'MEDIUM',
        category: 'BILLING',
        clientId: clientBOrgId,
        createdById: clientBUserId,
      },
    });
    ticketBId = ticketB.id;

    // 5. Generate Tokens
    adminToken = generateAccessToken({ sub: adminUserId, email: adminUser.email });
    clientAToken = generateAccessToken({ sub: clientAUserId, email: clientAUser.email });
    clientBToken = generateAccessToken({ sub: clientBUserId, email: clientBUser.email });
  });

  afterAll(async () => {
    await prisma.ticketComment.deleteMany({ where: { ticketId: { in: [ticketAId, ticketBId] } } });
    await prisma.ticket.deleteMany({ where: { id: { in: [ticketAId, ticketBId] } } });
    await prisma.client.deleteMany({ where: { id: { in: [clientAOrgId, clientBOrgId] } } });
    await prisma.userRole.deleteMany({ where: { userId: { in: [adminUserId, clientAUserId, clientBUserId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [adminUserId, clientAUserId, clientBUserId] } } });
  });

  describe('Admin / Staff Ticket Conversations', () => {
    it('1. should allow Admin to post an internal note on a ticket', async () => {
      const res = await request(app)
        .post(`/api/v1/tickets/${ticketAId}/comments`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          message: 'Internal Note: Investigating database pool limits.',
          isInternal: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isInternal).toBe(true);
      expect(res.body.data.message).toContain('Internal Note');
    });

    it('2. should allow Admin to post a client-visible reply on a ticket', async () => {
      const res = await request(app)
        .post(`/api/v1/tickets/${ticketAId}/comments`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          message: 'Public Reply: We are reviewing your issue and will resolve it shortly.',
          isInternal: false,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isInternal).toBe(false);
    });

    it('7. should allow Admin to view all comments including internal notes', async () => {
      const res = await request(app)
        .get(`/api/v1/tickets/${ticketAId}/comments`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      const internalComments = res.body.data.filter((c: any) => c.isInternal);
      expect(internalComments.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Client Portal Ticket Conversations', () => {
    it('3. should allow Client A to post a reply on their own ticket', async () => {
      const res = await request(app)
        .post(`/api/v1/client-portal/tickets/${ticketAId}/comments`)
        .set('Authorization', `Bearer ${clientAToken}`)
        .send({
          message: 'Thank you, providing additional diagnostic logs.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isInternal).toBe(false);
      expect(res.body.data.message).toContain('diagnostic logs');
    });

    it('4. should allow Client A to retrieve detailed ticket with comments', async () => {
      const res = await request(app)
        .get(`/api/v1/client-portal/tickets/${ticketAId}`)
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(ticketAId);
      expect(res.body.data.comments).toBeDefined();
    });

    it('5. should DENY Client A access to retrieve Client B ticket with 404', async () => {
      const res = await request(app)
        .get(`/api/v1/client-portal/tickets/${ticketBId}`)
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should DENY Client B access to retrieve Client A ticket with 404', async () => {
      const res = await request(app)
        .get(`/api/v1/client-portal/tickets/${ticketAId}`)
        .set('Authorization', `Bearer ${clientBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('6. should HIDE internal notes from Client A in ticket detail comments', async () => {
      const res = await request(app)
        .get(`/api/v1/client-portal/tickets/${ticketAId}`)
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(200);
      const comments = res.body.data.comments;
      const hasInternal = comments.some((c: any) => c.isInternal === true);
      expect(hasInternal).toBe(false);
    });

    it('should DENY Client A posting comment on Client B ticket with 404', async () => {
      const res = await request(app)
        .post(`/api/v1/client-portal/tickets/${ticketBId}/comments`)
        .set('Authorization', `Bearer ${clientAToken}`)
        .send({
          message: 'Attempting cross-tenant comment',
        });

      expect(res.status).toBe(404);
    });
  });

  describe('Validation & Security Edge Cases', () => {
    it('8. should DENY unauthenticated access to ticket endpoints with 401', async () => {
      const res = await request(app).get(`/api/v1/tickets/${ticketAId}/comments`);
      expect(res.status).toBe(401);
    });

    it('9. should handle invalid ticket UUID gracefully with 400 Bad Request', async () => {
      const res = await request(app)
        .get('/api/v1/tickets/invalid-uuid/comments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });

    it('10. should reject empty comment message with 400 Bad Request', async () => {
      const res = await request(app)
        .post(`/api/v1/client-portal/tickets/${ticketAId}/comments`)
        .set('Authorization', `Bearer ${clientAToken}`)
        .send({
          message: '   ',
        });

      expect(res.status).toBe(400);
    });

    it('11 & 12. should verify existing Admin ticket creation and listing still work', async () => {
      const createRes = await request(app)
        .post('/api/v1/tickets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          subject: 'New Technical Ticket',
          description: 'Testing ticket creation with category',
          category: 'TECHNICAL',
          priority: 'HIGH',
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.data.category).toBe('TECHNICAL');

      const listRes = await request(app)
        .get('/api/v1/tickets')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.items.length).toBeGreaterThanOrEqual(1);

      // Cleanup
      await prisma.ticket.delete({ where: { id: createRes.body.data.id } });
    });

    it('13. should verify existing Client ticket listing still works', async () => {
      const res = await request(app)
        .get('/api/v1/client-portal/tickets')
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('14. should preserve RBAC behavior denying CLIENT user access to admin /api/v1/tickets with 403', async () => {
      const res = await request(app)
        .get('/api/v1/tickets')
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(403);
    });
  });
});
