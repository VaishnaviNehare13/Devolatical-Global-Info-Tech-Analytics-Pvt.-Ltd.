import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/db';
import { generateAccessToken } from '../../../shared/utils/jwt';
import { SYSTEM_ROLES } from '../../../shared/constants/roles';

describe('Clients Module Integration Tests', () => {
  let adminToken: string;
  let employeeToken: string;

  let adminUserId: string;
  let employeeUserId: string;

  let testClientId: string;
  let archivedClientId: string;

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

    if (adminRole.name !== SYSTEM_ROLES.ADMIN) {
      adminRole = await prisma.role.update({
        where: { id: adminRole.id },
        data: { name: SYSTEM_ROLES.ADMIN },
      });
    }

    // 2. Setup Test Admin User
    const adminUser = await prisma.user.create({
      data: {
        email: 'clt_test_admin@example.com',
        firstName: 'CltAdmin',
        lastName: 'User',
        displayName: 'CltAdmin User',
      },
    });
    adminUserId = adminUser.id;
    await prisma.userRole.create({ data: { userId: adminUserId, roleId: adminRole.id } });

    // 3. Setup Test Non-Admin User (Employee)
    const employeeUser = await prisma.user.create({
      data: {
        email: 'clt_test_emp@example.com',
        firstName: 'CltEmp',
        lastName: 'User',
        displayName: 'CltEmp User',
      },
    });
    employeeUserId = employeeUser.id;
    await prisma.userRole.create({ data: { userId: employeeUserId, roleId: employeeRole.id } });

    // 4. Generate JWT Tokens
    adminToken = generateAccessToken({
      sub: adminUserId,
      email: adminUser.email,
    });

    employeeToken = generateAccessToken({
      sub: employeeUserId,
      email: employeeUser.email,
    });
  });

  afterAll(async () => {
    // Cleanup created test records
    await prisma.client.deleteMany({
      where: { code: { in: ['CLT-TEST-01', 'CLT-TEST-02', 'CLT-ARCH-01'] } },
    });
    await prisma.userRole.deleteMany({ where: { userId: { in: [adminUserId, employeeUserId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [adminUserId, employeeUserId] } } });
  });

  describe('1. Authentication and Authorization Guard Tests', () => {
    it('should return 401 when request lacks authorization token', async () => {
      const res = await request(app).get('/api/v1/clients');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 403 when non-admin user attempts client mutation', async () => {
      const res = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ name: 'Unauthorized Client', code: 'CLT-UNAUTH' });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. POST /api/v1/clients (Create Client)', () => {
    it('should successfully create a valid client organization profile', async () => {
      const payload = {
        name: 'Nexus Corp Global',
        code: 'CLT-TEST-01',
        email: 'contact@nexuscorp.example.com',
        phone: '+15552345678',
        website: 'https://nexuscorp.example.com',
        accountManagerId: adminUserId,
      };

      const res = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('CLT-TEST-01');
      expect(res.body.data.email).toBe('contact@nexuscorp.example.com');

      testClientId = res.body.data.id;

      // Database verification
      const dbClient = await prisma.client.findUnique({ where: { id: testClientId } });
      expect(dbClient).not.toBeNull();
      expect(dbClient?.name).toBe('Nexus Corp Global');
    });

    it('should reject client creation when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'missing_name@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject client creation with 409 when client code is duplicated', async () => {
      const payload = {
        name: 'Duplicate Client Corp',
        code: 'CLT-TEST-01',
      };

      const res = await request(app)
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. GET /api/v1/clients (List & Search)', () => {
    it('should list clients with pagination metadata', async () => {
      const res = await request(app)
        .get('/api/v1/clients?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.total).toBeGreaterThanOrEqual(1);
    });

    it('should search clients by keyword in name/code/email', async () => {
      const res = await request(app)
        .get('/api/v1/clients?search=CLT-TEST-01')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.items[0].code).toBe('CLT-TEST-01');
    });
  });

  describe('4. GET /api/v1/clients/:id (Get by ID)', () => {
    it('should retrieve client details by valid ID', async () => {
      const res = await request(app)
        .get(`/api/v1/clients/${testClientId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testClientId);
      expect(res.body.data.code).toBe('CLT-TEST-01');
    });

    it('should return 404 for nonexistent client UUID', async () => {
      const res = await request(app)
        .get('/api/v1/clients/00000000-0000-4000-a000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid UUID format parameter', async () => {
      const res = await request(app)
        .get('/api/v1/clients/invalid-client-uuid')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('5. PATCH /api/v1/clients/:id (Update Details)', () => {
    it('should update client details successfully', async () => {
      const payload = {
        name: 'Updated Nexus Corp Global',
        phone: '+15559998888',
        notes: 'Updated client account notes',
      };

      const res = await request(app)
        .patch(`/api/v1/clients/${testClientId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Nexus Corp Global');

      // Verify database update
      const dbClient = await prisma.client.findUnique({ where: { id: testClientId } });
      expect(dbClient?.name).toBe('Updated Nexus Corp Global');
    });

    it('should return 404 when updating nonexistent client', async () => {
      const res = await request(app)
        .patch('/api/v1/clients/00000000-0000-4000-a000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Ghost Client' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('6. DELETE and Restore Lifecycle Tests', () => {
    beforeAll(async () => {
      // Create client specifically for soft-delete testing
      const archClient = await prisma.client.create({
        data: {
          name: 'Archival Test Client',
          code: 'CLT-ARCH-01',
          status: 'ACTIVE',
        },
      });
      archivedClientId = archClient.id;
    });

    it('should archive (soft delete) client account with 204 No Content', async () => {
      const res = await request(app)
        .delete(`/api/v1/clients/${archivedClientId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);

      // Verify database soft-deleted state
      const dbClient = await prisma.client.findUnique({ where: { id: archivedClientId } });
      expect(dbClient?.deletedAt).not.toBeNull();
    });

    it('should restore an archived client account back to active state', async () => {
      const res = await request(app)
        .post(`/api/v1/clients/${archivedClientId}/restore`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify database restored state
      const dbClient = await prisma.client.findUnique({ where: { id: archivedClientId } });
      expect(dbClient?.deletedAt).toBeNull();
    });
  });
});
