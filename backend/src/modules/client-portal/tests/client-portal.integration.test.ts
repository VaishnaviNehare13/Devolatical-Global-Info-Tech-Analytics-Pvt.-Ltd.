import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/db';
import { generateAccessToken } from '../../../shared/utils/jwt';

describe('Client Portal Security & Tenant Isolation Integration Tests', () => {
  let clientAToken: string;
  let unmappedClientToken: string;

  let clientAId: string;
  let clientBId: string;

  let userAId: string;
  let userBId: string;
  let userUnmappedId: string;

  let projectAId: string;
  let projectBId: string;

  let invoiceAId: string;
  let invoiceBId: string;

  let ticketAId: string;
  let ticketBId: string;

  beforeAll(async () => {
    // 1. Create Client Role if not present
    let clientRole = await prisma.role.findUnique({ where: { code: 'CLIENT' } });
    if (!clientRole) {
      clientRole = await prisma.role.create({
        data: { name: 'Client Role', code: 'CLIENT', isSystem: true },
      });
    }

    // 2. Create Users
    const userA = await prisma.user.create({
      data: {
        email: 'clientA_test@example.com',
        firstName: 'ClientA',
        lastName: 'User',
        displayName: 'ClientA User',
      },
    });
    userAId = userA.id;
    await prisma.userRole.create({ data: { userId: userAId, roleId: clientRole.id } });

    const userB = await prisma.user.create({
      data: {
        email: 'clientB_test@example.com',
        firstName: 'ClientB',
        lastName: 'User',
        displayName: 'ClientB User',
      },
    });
    userBId = userB.id;
    await prisma.userRole.create({ data: { userId: userBId, roleId: clientRole.id } });

    const userUnmapped = await prisma.user.create({
      data: {
        email: 'unmapped_client_test@example.com',
        firstName: 'Unmapped',
        lastName: 'Client',
        displayName: 'Unmapped Client',
      },
    });
    userUnmappedId = userUnmapped.id;
    await prisma.userRole.create({ data: { userId: userUnmappedId, roleId: clientRole.id } });

    // 3. Create Client Organizations
    const clientA = await prisma.client.create({
      data: {
        name: 'Client Org A',
        code: 'CLT-A-TEST',
        email: 'clientA_test@example.com',
        accountManagerId: userAId,
      },
    });
    clientAId = clientA.id;

    const clientB = await prisma.client.create({
      data: {
        name: 'Client Org B',
        code: 'CLT-B-TEST',
        email: 'clientB_test@example.com',
        accountManagerId: userBId,
      },
    });
    clientBId = clientB.id;

    // 4. Create Projects
    const projectA = await prisma.project.create({
      data: {
        name: 'Project A',
        code: 'PRJ-A-TEST',
        clientId: clientAId,
      },
    });
    projectAId = projectA.id;

    const projectB = await prisma.project.create({
      data: {
        name: 'Project B',
        code: 'PRJ-B-TEST',
        clientId: clientBId,
      },
    });
    projectBId = projectB.id;

    // 5. Create Invoices
    const invoiceA = await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-A-1001',
        amount: 5000,
        currency: 'USD',
        status: 'PENDING',
        clientId: clientAId,
        projectId: projectAId,
      },
    });
    invoiceAId = invoiceA.id;

    const invoiceB = await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-B-2002',
        amount: 8500,
        currency: 'USD',
        status: 'PENDING',
        clientId: clientBId,
        projectId: projectBId,
      },
    });
    invoiceBId = invoiceB.id;

    // 6. Create Support Tickets
    const ticketA = await prisma.ticket.create({
      data: {
        subject: 'Ticket A Subject',
        description: 'Ticket A Description',
        status: 'OPEN',
        clientId: clientAId,
        projectId: projectAId,
      },
    });
    ticketAId = ticketA.id;

    const ticketB = await prisma.ticket.create({
      data: {
        subject: 'Ticket B Subject',
        description: 'Ticket B Description',
        status: 'OPEN',
        clientId: clientBId,
        projectId: projectBId,
      },
    });
    ticketBId = ticketB.id;

    // 7. Generate Access Tokens
    clientAToken = generateAccessToken({ sub: userAId, email: userA.email });
    unmappedClientToken = generateAccessToken({ sub: userUnmappedId, email: userUnmapped.email });
  });

  afterAll(async () => {
    // Clean up created test records
    await prisma.ticket.deleteMany({ where: { id: { in: [ticketAId, ticketBId] } } });
    await prisma.invoice.deleteMany({ where: { id: { in: [invoiceAId, invoiceBId] } } });
    await prisma.project.deleteMany({ where: { id: { in: [projectAId, projectBId] } } });
    await prisma.client.deleteMany({ where: { id: { in: [clientAId, clientBId] } } });
    await prisma.userRole.deleteMany({ where: { userId: { in: [userAId, userBId, userUnmappedId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userAId, userBId, userUnmappedId] } } });
  });

  describe('A & B: CLIENT Access Rights & Functionality', () => {
    it('should allow Client A to access GET /api/v1/client-portal/overview', async () => {
      const res = await request(app)
        .get('/api/v1/client-portal/overview')
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.activeProjectsCount).toBe(1);
      expect(res.body.data.pendingInvoiceTotal).toBe(5000);
      expect(res.body.data.openTicketsCount).toBe(1);
    });

    it('should allow Client A to access GET /api/v1/client-portal/projects', async () => {
      const res = await request(app)
        .get('/api/v1/client-portal/projects')
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].id).toBe(projectAId);
    });

    it('should allow Client A to access GET /api/v1/client-portal/invoices', async () => {
      const res = await request(app)
        .get('/api/v1/client-portal/invoices')
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].id).toBe(invoiceAId);
    });

    it('should allow Client A to access GET /api/v1/client-portal/tickets', async () => {
      const res = await request(app)
        .get('/api/v1/client-portal/tickets')
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].id).toBe(ticketAId);
    });
  });

  describe('C: Admin Endpoint Access Controls', () => {
    it('should DENY Client A access to admin GET /api/v1/invoices returning 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/invoices')
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('E: Cross-Tenant Isolation Enforcement', () => {
    it('should NOT allow Client A to view Client B projects', async () => {
      const res = await request(app)
        .get('/api/v1/client-portal/projects')
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(200);
      const projectIds = res.body.data.map((p: any) => p.id);
      expect(projectIds).toContain(projectAId);
      expect(projectIds).not.toContain(projectBId);
    });

    it('should NOT allow Client A to view Client B invoices', async () => {
      const res = await request(app)
        .get('/api/v1/client-portal/invoices')
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(200);
      const invoiceIds = res.body.data.map((i: any) => i.id);
      expect(invoiceIds).toContain(invoiceAId);
      expect(invoiceIds).not.toContain(invoiceBId);
    });

    it('should NOT allow Client A to view Client B tickets', async () => {
      const res = await request(app)
        .get('/api/v1/client-portal/tickets')
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(200);
      const ticketIds = res.body.data.map((t: any) => t.id);
      expect(ticketIds).toContain(ticketAId);
      expect(ticketIds).not.toContain(ticketBId);
    });
  });

  describe('F: Unmapped Client Behavior', () => {
    it('should DENY access to an unmapped CLIENT user with 403 Forbidden without falling back', async () => {
      const res = await request(app)
        .get('/api/v1/client-portal/overview')
        .set('Authorization', `Bearer ${unmappedClientToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No client organization associated with this user account');
    });
  });
});
