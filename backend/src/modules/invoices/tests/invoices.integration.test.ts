import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/db';
import { generateAccessToken } from '../../../shared/utils/jwt';

describe('Invoice PDF Generation & Milestone Billing Integration Tests', () => {
  let adminToken: string;
  let clientAToken: string;
  let clientBToken: string;

  let adminUserId: string;
  let clientAUserId: string;
  let clientBUserId: string;

  let clientAOrgId: string;
  let clientBOrgId: string;

  let projectAId: string;
  let milestoneAId: string;

  let invoiceAId: string;
  let invoiceBId: string;

  beforeAll(async () => {
    // 1. Roles
    let adminRole = await prisma.role.findUnique({ where: { code: 'SUPER_ADMIN' } });
    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: { name: 'Super Admin', code: 'SUPER_ADMIN', type: 'SYSTEM', isSystem: true },
      });
    }

    let clientRole = await prisma.role.findUnique({ where: { code: 'CLIENT' } });
    if (!clientRole) {
      clientRole = await prisma.role.create({
        data: { name: 'Client Role', code: 'CLIENT', isSystem: true },
      });
    }

    // 2. Users
    const adminUser = await prisma.user.create({
      data: {
        email: 'inv_admin_test@example.com',
        firstName: 'InvAdmin',
        lastName: 'User',
        displayName: 'InvAdmin User',
      },
    });
    adminUserId = adminUser.id;
    await prisma.userRole.create({ data: { userId: adminUserId, roleId: adminRole.id } });

    const clientAUser = await prisma.user.create({
      data: {
        email: 'inv_clientA_test@example.com',
        firstName: 'InvClientA',
        lastName: 'User',
        displayName: 'InvClientA User',
      },
    });
    clientAUserId = clientAUser.id;
    await prisma.userRole.create({ data: { userId: clientAUserId, roleId: clientRole.id } });

    const clientBUser = await prisma.user.create({
      data: {
        email: 'inv_clientB_test@example.com',
        firstName: 'InvClientB',
        lastName: 'User',
        displayName: 'InvClientB User',
      },
    });
    clientBUserId = clientBUser.id;
    await prisma.userRole.create({ data: { userId: clientBUserId, roleId: clientRole.id } });

    // 3. Client Organizations
    const clientAOrg = await prisma.client.create({
      data: {
        name: 'Invoice Client Org A',
        code: 'CLT-INV-A',
        email: 'inv_clientA_test@example.com',
        accountManagerId: clientAUserId,
      },
    });
    clientAOrgId = clientAOrg.id;

    const clientBOrg = await prisma.client.create({
      data: {
        name: 'Invoice Client Org B',
        code: 'CLT-INV-B',
        email: 'inv_clientB_test@example.com',
        accountManagerId: clientBUserId,
      },
    });
    clientBOrgId = clientBOrg.id;

    // 4. Project & Milestone
    const projectA = await prisma.project.create({
      data: {
        name: 'Cloud Data Lake Pipeline',
        code: 'PRJ-INV-A',
        clientId: clientAOrgId,
        createdById: adminUserId,
      },
    });
    projectAId = projectA.id;

    const milestoneA = await prisma.milestone.create({
      data: {
        title: 'Phase 1 Architecture Approval',
        status: 'COMPLETED',
        projectId: projectAId,
        createdById: adminUserId,
      },
    });
    milestoneAId = milestoneA.id;

    // 5. Invoices
    const invoiceA = await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-TEST-A101',
        description: 'Milestone 1 Completion Payment',
        amount: 12500.00,
        currency: 'USD',
        status: 'PENDING',
        clientId: clientAOrgId,
        projectId: projectAId,
        milestoneId: milestoneAId,
        createdById: adminUserId,
      },
    });
    invoiceAId = invoiceA.id;

    const invoiceB = await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-TEST-B202',
        description: 'Consulting Retainer for Client B',
        amount: 7500.00,
        currency: 'USD',
        status: 'PAID',
        clientId: clientBOrgId,
        createdById: adminUserId,
      },
    });
    invoiceBId = invoiceB.id;

    // 6. Tokens
    adminToken = generateAccessToken({ sub: adminUserId, email: adminUser.email });
    clientAToken = generateAccessToken({ sub: clientAUserId, email: clientAUser.email });
    clientBToken = generateAccessToken({ sub: clientBUserId, email: clientBUser.email });
  });

  afterAll(async () => {
    await prisma.invoice.deleteMany({ where: { id: { in: [invoiceAId, invoiceBId] } } });
    await prisma.milestone.deleteMany({ where: { id: milestoneAId } });
    await prisma.project.deleteMany({ where: { id: projectAId } });
    await prisma.client.deleteMany({ where: { id: { in: [clientAOrgId, clientBOrgId] } } });
    await prisma.userRole.deleteMany({ where: { userId: { in: [adminUserId, clientAUserId, clientBUserId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [adminUserId, clientAUserId, clientBUserId] } } });
  });

  describe('1. Milestone Billing & Invoice CRUD', () => {
    it('should create an invoice associated with a milestone', async () => {
      const res = await request(app)
        .post('/api/v1/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          invoiceNumber: 'INV-TEST-NEW-001',
          description: 'Phase 2 Milestone Billing',
          amount: 15000,
          clientId: clientAOrgId,
          projectId: projectAId,
          milestoneId: milestoneAId,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.milestoneId).toBe(milestoneAId);
      expect(res.body.data.milestone).toBeDefined();

      // Cleanup
      await prisma.invoice.delete({ where: { id: res.body.data.id } });
    });

    it('should list invoices with milestoneId filter', async () => {
      const res = await request(app)
        .get(`/api/v1/invoices?milestoneId=${milestoneAId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('2. Server-Side Invoice PDF Generation (Admin Endpoint)', () => {
    it('should generate and download invoice PDF via GET /api/v1/invoices/:id/pdf', async () => {
      const res = await request(app)
        .get(`/api/v1/invoices/${invoiceAId}/pdf`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toContain('attachment; filename="Invoice-INV-TEST-A101.pdf"');

      // Verify PDF magic bytes header (%PDF-1.)
      const pdfBuffer = Buffer.isBuffer(res.body) ? res.body : Buffer.from(res.text);
      expect(pdfBuffer.toString('utf8', 0, 5)).toContain('%PDF-');
    });

    it('should return 400 for invalid UUID format parameter on PDF request', async () => {
      const res = await request(app)
        .get('/api/v1/invoices/invalid-uuid-format/pdf')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent invoice UUID on PDF request', async () => {
      const res = await request(app)
        .get('/api/v1/invoices/00000000-0000-0000-0000-000000000000/pdf')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('3. Client Portal Invoice PDF Access & Tenant Isolation', () => {
    it('should allow Client A to list their own invoices via Client Portal', async () => {
      const res = await request(app)
        .get('/api/v1/client-portal/invoices')
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const invoiceIds = res.body.data.map((i: any) => i.id);
      expect(invoiceIds).toContain(invoiceAId);
      expect(invoiceIds).not.toContain(invoiceBId);
    });

    it('should allow Client A to download their own invoice PDF via GET /api/v1/client-portal/invoices/:id/pdf', async () => {
      const res = await request(app)
        .get(`/api/v1/client-portal/invoices/${invoiceAId}/pdf`)
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      const pdfBuffer = Buffer.isBuffer(res.body) ? res.body : Buffer.from(res.text);
      expect(pdfBuffer.toString('utf8', 0, 5)).toContain('%PDF-');
    });

    it('should DENY Client A attempting to download Client B invoice PDF with 404', async () => {
      const res = await request(app)
        .get(`/api/v1/client-portal/invoices/${invoiceBId}/pdf`)
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should DENY Client B attempting to download Client A invoice PDF with 404', async () => {
      const res = await request(app)
        .get(`/api/v1/client-portal/invoices/${invoiceAId}/pdf`)
        .set('Authorization', `Bearer ${clientBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('4. Security & RBAC Enforcement', () => {
    it('should return 401 Unauthorized for unauthenticated PDF requests', async () => {
      const res = await request(app).get(`/api/v1/invoices/${invoiceAId}/pdf`);
      expect(res.status).toBe(401);
    });

    it('should DENY CLIENT role user access to admin invoice list with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/invoices')
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(403);
    });
  });
});
