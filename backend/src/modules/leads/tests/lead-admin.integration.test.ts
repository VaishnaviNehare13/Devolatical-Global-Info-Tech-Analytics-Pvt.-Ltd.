import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/db';
import { generateAccessToken } from '../../../shared/utils/jwt';
import { SYSTEM_ROLES } from '../../../shared/constants/roles';

describe('Admin Lead Management Integration Tests', () => {
  let adminToken: string;
  let employeeToken: string;
  let clientToken: string;

  let adminUserId: string;
  let employeeUserId: string;
  let clientUserId: string;

  let testLeadId: string;

  beforeAll(async () => {
    // 1. Setup Roles safely matching SYSTEM_ROLES
    let adminRole = await prisma.role.findFirst({
      where: { OR: [{ code: 'ADMIN' }, { name: SYSTEM_ROLES.ADMIN }] },
    });
    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: { name: SYSTEM_ROLES.ADMIN, code: 'ADMIN', isSystem: true },
      });
    }

    let employeeRole = await prisma.role.findFirst({
      where: { OR: [{ code: 'EMPLOYEE' }, { name: SYSTEM_ROLES.EMPLOYEE }] },
    });
    if (!employeeRole) {
      employeeRole = await prisma.role.create({
        data: { name: SYSTEM_ROLES.EMPLOYEE, code: 'EMPLOYEE', isSystem: true },
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

    // 2. Setup Test Admin User
    const adminUser = await prisma.user.create({
      data: {
        email: 'lead_test_admin@example.com',
        firstName: 'LeadAdmin',
        lastName: 'User',
        displayName: 'LeadAdmin User',
      },
    });
    adminUserId = adminUser.id;
    await prisma.userRole.create({ data: { userId: adminUserId, roleId: adminRole.id } });

    // 3. Setup Test Employee User
    const employeeUser = await prisma.user.create({
      data: {
        email: 'lead_test_emp@example.com',
        firstName: 'LeadEmp',
        lastName: 'User',
        displayName: 'LeadEmp User',
      },
    });
    employeeUserId = employeeUser.id;
    await prisma.userRole.create({ data: { userId: employeeUserId, roleId: employeeRole.id } });

    // 4. Setup Test Client User
    const clientUser = await prisma.user.create({
      data: {
        email: 'lead_test_client@example.com',
        firstName: 'LeadClient',
        lastName: 'User',
        displayName: 'LeadClient User',
      },
    });
    clientUserId = clientUser.id;
    await prisma.userRole.create({ data: { userId: clientUserId, roleId: clientRole.id } });

    // 5. Generate Tokens
    adminToken = generateAccessToken({ sub: adminUserId, email: adminUser.email });
    employeeToken = generateAccessToken({ sub: employeeUserId, email: employeeUser.email });
    clientToken = generateAccessToken({ sub: clientUserId, email: clientUser.email });

    // 6. Create a test lead in DB
    const createdLead = await prisma.lead.create({
      data: {
        name: 'Lead Admin Integration Test',
        email: 'lead_admin_test@example.com',
        companyName: 'Test Corp Ltd',
        source: 'WEBSITE',
        status: 'NEW',
        priority: 'HIGH',
        industry: 'Custom Software',
        notes: 'Admin lead test inquiry notes',
      },
    });
    testLeadId = createdLead.id;
  });

  afterAll(async () => {
    if (testLeadId) {
      await prisma.lead.deleteMany({ where: { id: testLeadId } });
    }
    // Clean up created test user roles and users
    await prisma.userRole.deleteMany({
      where: { userId: { in: [adminUserId, employeeUserId, clientUserId].filter(Boolean) } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [adminUserId, employeeUserId, clientUserId].filter(Boolean) } },
    });
  });

  describe('RBAC Guards on Administrative Lead Endpoints', () => {
    it('should return 401 Unauthorized for GET /api/v1/leads without token', async () => {
      const res = await request(app).get('/api/v1/leads');
      expect(res.status).toBe(401);
    });

    it('should return 403 Forbidden for EMPLOYEE users accessing GET /api/v1/leads', async () => {
      const res = await request(app)
        .get('/api/v1/leads')
        .set('Authorization', `Bearer ${employeeToken}`);
      expect(res.status).toBe(403);
    });

    it('should return 403 Forbidden for CLIENT users accessing GET /api/v1/leads', async () => {
      const res = await request(app)
        .get('/api/v1/leads')
        .set('Authorization', `Bearer ${clientToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('Admin Lead CRUD Operations', () => {
    it('should allow ADMIN / SUPER_ADMIN to list leads with pagination and search', async () => {
      const res = await request(app)
        .get('/api/v1/leads?search=Lead Admin Integration Test')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toBeDefined();
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);

      const found = res.body.data.items.find((item: any) => item.id === testLeadId);
      expect(found).toBeDefined();
      expect(found.name).toBe('Lead Admin Integration Test');
    });

    it('should allow ADMIN to retrieve lead details by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/leads/${testLeadId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testLeadId);
      expect(res.body.data.notes).toBe('Admin lead test inquiry notes');
    });

    it('should allow ADMIN to update lead status and notes', async () => {
      const updatePayload = {
        status: 'QUALIFIED',
        notes: 'Updated lead review notes',
      };

      const res = await request(app)
        .patch(`/api/v1/leads/${testLeadId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('QUALIFIED');
      expect(res.body.data.notes).toBe('Updated lead review notes');
    });

    it('should allow ADMIN to soft-delete (archive) and restore a lead', async () => {
      // 1. Soft delete
      const deleteRes = await request(app)
        .delete(`/api/v1/leads/${testLeadId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(204);

      // 2. Verify lead is excluded from standard list
      const listRes = await request(app)
        .get('/api/v1/leads?search=Lead Admin Integration Test')
        .set('Authorization', `Bearer ${adminToken}`);

      const foundInActive = listRes.body.data.items.find((item: any) => item.id === testLeadId);
      expect(foundInActive).toBeUndefined();

      // 3. Verify lead is found when includeDeleted=true
      const listDeletedRes = await request(app)
        .get('/api/v1/leads?search=Lead Admin Integration Test&includeDeleted=true')
        .set('Authorization', `Bearer ${adminToken}`);

      const foundInDeleted = listDeletedRes.body.data.items.find((item: any) => item.id === testLeadId);
      expect(foundInDeleted).toBeDefined();
      expect(foundInDeleted.deletedAt).not.toBeNull();

      // 4. Restore lead
      const restoreRes = await request(app)
        .post(`/api/v1/leads/${testLeadId}/restore`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(restoreRes.status).toBe(200);
      expect(restoreRes.body.success).toBe(true);
      expect(restoreRes.body.data.id).toBe(testLeadId);

      const restoredDbLead = await prisma.lead.findUnique({ where: { id: testLeadId } });
      expect(restoredDbLead?.deletedAt).toBeNull();
    });
  });
});
