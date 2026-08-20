import request from 'supertest';
import express from 'express';
import { prisma } from '../../../config/db';
import { generateAccessToken } from '../../../shared/utils/jwt';
import { AuthMiddleware } from '../../../middleware/auth.middleware';
import { AuthRepository } from '../../auth/repositories/auth.repository';
import { createAnalyticsModule } from '../index';
import { InvoiceStatus, TicketPriority, TicketStatus, ProjectStatus } from '@prisma/client';

describe('Domain Analytics, Reporting & CSV/PDF Exports Integration Tests', () => {
  let testApp: express.Application;

  let staffToken: string;
  let clientAToken: string;
  let clientBToken: string;

  let staffUserId: string;
  let clientAUserId: string;
  let clientBUserId: string;

  let clientAOrgId: string;
  let clientBOrgId: string;

  let projectAId: string;
  let projectBId: string;

  let lead1Id: string;
  let invoiceAId: string;
  let invoiceBId: string;

  beforeAll(async () => {
    // 1. Staff User
    const staffUser = await prisma.user.create({
      data: {
        firstName: 'Analytics',
        lastName: 'Staff',
        displayName: 'Analytics Staff',
        email: `analytics.staff.${Date.now()}@example.com`,
        status: 'ACTIVE',
      },
    });
    staffUserId = staffUser.id;
    staffToken = generateAccessToken({ sub: staffUser.id, email: staffUser.email });

    const superAdminRole = await prisma.role.findFirst({ where: { code: 'SUPER_ADMIN' } });
    if (superAdminRole) {
      await prisma.userRole.create({
        data: { userId: staffUserId, roleId: superAdminRole.id },
      });
    }

    // 2. Client A User & Org
    const clientAUser = await prisma.user.create({
      data: {
        firstName: 'Client',
        lastName: 'UserA',
        displayName: 'Client User A',
        email: `analytics.client.a.${Date.now()}@example.com`,
        status: 'ACTIVE',
      },
    });
    clientAUserId = clientAUser.id;
    clientAToken = generateAccessToken({ sub: clientAUser.id, email: clientAUser.email });

    const clientAOrg = await prisma.client.create({
      data: {
        name: 'Alpha Analytics Org A',
        code: `CL-ANA-${Date.now()}`,
        email: clientAUser.email,
        status: 'ACTIVE',
      },
    });
    clientAOrgId = clientAOrg.id;

    // Client Role assignment for clientAUser
    const clientRole = await prisma.role.findFirst({ where: { code: 'CLIENT' } });
    if (clientRole) {
      await prisma.userRole.create({
        data: { userId: clientAUserId, roleId: clientRole.id },
      });
    }

    // 3. Client B User & Org
    const clientBUser = await prisma.user.create({
      data: {
        firstName: 'Client',
        lastName: 'UserB',
        displayName: 'Client User B',
        email: `analytics.client.b.${Date.now()}@example.com`,
        status: 'ACTIVE',
      },
    });
    clientBUserId = clientBUser.id;
    clientBToken = generateAccessToken({ sub: clientBUser.id, email: clientBUser.email });

    const clientBOrg = await prisma.client.create({
      data: {
        name: 'Beta Analytics Org B',
        code: `CL-ANB-${Date.now()}`,
        email: clientBUser.email,
        status: 'ACTIVE',
      },
    });
    clientBOrgId = clientBOrg.id;

    if (clientRole) {
      await prisma.userRole.create({
        data: { userId: clientBUserId, roleId: clientRole.id },
      });
    }

    // 4. Test Projects & Records
    const projectA = await prisma.project.create({
      data: {
        name: 'Project Alpha Data Engine',
        code: `PRJ-ANA-${Date.now()}`,
        clientId: clientAOrgId,
        status: ProjectStatus.ACTIVE,
      },
    });
    projectAId = projectA.id;

    const projectB = await prisma.project.create({
      data: {
        name: 'Project Beta Warehouse',
        code: `PRJ-ANB-${Date.now()}`,
        clientId: clientBOrgId,
        status: ProjectStatus.ACTIVE,
      },
    });
    projectBId = projectB.id;

    // Leads
    const lead1 = await prisma.lead.create({
      data: {
        name: 'Lead Quantum Tech',
        email: 'quantum@example.com',
        companyName: 'Quantum Systems',
        status: 'WON',
        source: 'WEBSITE',
      },
    });
    lead1Id = lead1.id;

    // Invoices for Client A ($5,000) & Client B ($90,000)
    const invoiceA = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-A-${Date.now()}`,
        clientId: clientAOrgId,
        projectId: projectAId,
        amount: 5000.0,
        currency: 'USD',
        status: InvoiceStatus.PAID,
      },
    });
    invoiceAId = invoiceA.id;

    const invoiceB = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-B-${Date.now()}`,
        clientId: clientBOrgId,
        projectId: projectBId,
        amount: 90000.0,
        currency: 'USD',
        status: InvoiceStatus.PENDING,
      },
    });
    invoiceBId = invoiceB.id;

    // Tickets
    await prisma.ticket.create({
      data: {
        subject: 'Alpha API Timeout',
        description: 'Investigating API latency.',
        priority: TicketPriority.HIGH,
        status: TicketStatus.OPEN,
        clientId: clientAOrgId,
        projectId: projectAId,
      },
    });

    // 5. Setup Express App
    testApp = express();
    testApp.use(express.json());

    const authRepository = new AuthRepository();
    const authMiddleware = new AuthMiddleware(authRepository);
    const authorizeStaff = (_req: express.Request, _res: express.Response, next: express.NextFunction) => next();

    const analyticsRouter = createAnalyticsModule(prisma, authMiddleware.handle, authorizeStaff);
    testApp.use('/api/v1/analytics', analyticsRouter);
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({ where: { clientId: { in: [clientAOrgId, clientBOrgId] } } });
    await prisma.invoice.deleteMany({ where: { id: { in: [invoiceAId, invoiceBId] } } });
    await prisma.lead.deleteMany({ where: { id: lead1Id } });
    await prisma.project.deleteMany({ where: { id: { in: [projectAId, projectBId] } } });
    await prisma.client.deleteMany({ where: { id: { in: [clientAOrgId, clientBOrgId] } } });
    await prisma.userRole.deleteMany({ where: { userId: { in: [staffUserId, clientAUserId, clientBUserId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [staffUserId, clientAUserId, clientBUserId] } } });
  });

  describe('1. Domain Analytics JSON Endpoints', () => {
    it('should return overview summary metrics via GET /api/v1/analytics/overview', async () => {
      const res = await request(testApp)
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.totalLeads).toBeGreaterThan(0);
      expect(res.body.data.summary.totalInvoices).toBeGreaterThan(0);
    });

    it('should return lead analytics breakdown via GET /api/v1/analytics/leads', async () => {
      const res = await request(testApp)
        .get('/api/v1/analytics/leads')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalLeads).toBeGreaterThan(0);
      expect(res.body.data.wonLeads).toBeGreaterThan(0);
    });

    it('should return financial analytics via GET /api/v1/analytics/financials', async () => {
      const res = await request(testApp)
        .get('/api/v1/analytics/financials')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalInvoices).toBeGreaterThan(0);
      expect(res.body.data.totalInvoicedAmount).toBeGreaterThan(0);
    });

    it('should return ticket analytics via GET /api/v1/analytics/tickets', async () => {
      const res = await request(testApp)
        .get('/api/v1/analytics/tickets')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalTickets).toBeGreaterThan(0);
    });

    it('should return project analytics via GET /api/v1/analytics/projects', async () => {
      const res = await request(testApp)
        .get('/api/v1/analytics/projects')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalProjects).toBeGreaterThan(0);
    });

    it('should return pipeline analytics via GET /api/v1/analytics/pipelines', async () => {
      const res = await request(testApp)
        .get('/api/v1/analytics/pipelines')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalPipelines).toBeDefined();
    });

    it('should return 401 Unauthorized for unauthenticated requests', async () => {
      const res = await request(testApp).get('/api/v1/analytics/overview');
      expect(res.status).toBe(401);
    });
  });

  describe('2. CSV Data Export Endpoints', () => {
    it('should export Leads CSV with text/csv header via GET /api/v1/analytics/leads/export', async () => {
      const res = await request(testApp)
        .get('/api/v1/analytics/leads/export')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment; filename="leads_report_');
      expect(res.text).toContain('Lead Name');
      expect(res.text).toContain('Quantum Systems');
    });

    it('should export Invoices CSV via GET /api/v1/analytics/invoices/export', async () => {
      const res = await request(testApp)
        .get('/api/v1/analytics/invoices/export')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment; filename="invoices_report_');
      expect(res.text).toContain('Invoice Number');
    });

    it('should export Tickets CSV via GET /api/v1/analytics/tickets/export', async () => {
      const res = await request(testApp)
        .get('/api/v1/analytics/tickets/export')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Subject');
    });

    it('should export Projects CSV via GET /api/v1/analytics/projects/export', async () => {
      const res = await request(testApp)
        .get('/api/v1/analytics/projects/export')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Project Name');
    });
  });

  describe('3. Executive PDF Report Export Endpoint', () => {
    it('should generate binary PDF summary report via GET /api/v1/analytics/reports/pdf', async () => {
      const res = await request(testApp)
        .get('/api/v1/analytics/reports/pdf')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/pdf');
      expect(res.headers['content-disposition']).toContain('attachment; filename="executive_overview_');
      expect(res.body).toBeInstanceOf(Buffer);
      expect(res.body.length).toBeGreaterThan(500);
    });
  });

  describe('4. Tenant Isolation & Client Scoping Verification', () => {
    it('should enforce client tenant isolation so Client A ONLY gets Client A financial metrics ($5,000 vs $90,000)', async () => {
      const res = await request(testApp)
        .get('/api/v1/analytics/financials')
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalInvoices).toBe(1);
      expect(res.body.data.totalInvoicedAmount).toBe(5000);
      expect(res.body.data.paidAmount).toBe(5000);
    });

    it('should enforce client tenant isolation so Client B ONLY gets Client B financial metrics ($90,000 vs $5,000)', async () => {
      const res = await request(testApp)
        .get('/api/v1/analytics/financials')
        .set('Authorization', `Bearer ${clientBToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalInvoices).toBe(1);
      expect(res.body.data.totalInvoicedAmount).toBe(90000);
      expect(res.body.data.pendingAmount).toBe(90000);
    });
  });
});
