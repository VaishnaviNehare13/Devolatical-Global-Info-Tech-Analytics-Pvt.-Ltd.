import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/db';
import { generateAccessToken } from '../../../shared/utils/jwt';
import { SYSTEM_ROLES } from '../../../shared/constants/roles';

describe('Projects Module Integration Tests', () => {
  let adminToken: string;
  let clientToken: string;

  let adminUserId: string;
  let clientUserId: string;

  let testClientId: string;
  let testProjectId: string;
  let archivedProjectId: string;

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
        email: 'prj_test_admin@example.com',
        firstName: 'PrjAdmin',
        lastName: 'User',
        displayName: 'PrjAdmin User',
      },
    });
    adminUserId = adminUser.id;
    await prisma.userRole.create({ data: { userId: adminUserId, roleId: adminRole.id } });

    // 3. Setup Test Non-Admin User (Client)
    const clientUser = await prisma.user.create({
      data: {
        email: 'prj_test_client_usr@example.com',
        firstName: 'PrjClient',
        lastName: 'User',
        displayName: 'PrjClient User',
      },
    });
    clientUserId = clientUser.id;
    await prisma.userRole.create({ data: { userId: clientUserId, roleId: clientRole.id } });

    // 4. Generate JWT Tokens
    adminToken = generateAccessToken({
      sub: adminUserId,
      email: adminUser.email,
    });

    clientToken = generateAccessToken({
      sub: clientUserId,
      email: clientUser.email,
    });

    // 5. Setup Test Client Org
    const clientOrg = await prisma.client.create({
      data: {
        name: 'Prj Test Client Org',
        code: 'PRJ-CLT-TST',
        email: 'prj_client@example.com',
        status: 'ACTIVE',
      },
    });
    testClientId = clientOrg.id;
  });

  afterAll(async () => {
    // Cleanup created test records
    await prisma.project.deleteMany({
      where: { code: { in: ['PRJ-TST-01', 'PRJ-TST-02', 'PRJ-ARCH-01'] } },
    });
    await prisma.client.deleteMany({ where: { id: testClientId } });
    await prisma.userRole.deleteMany({ where: { userId: { in: [adminUserId, clientUserId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [adminUserId, clientUserId] } } });
  });

  describe('1. Authentication and Authorization Guard Tests', () => {
    it('should return 401 when request lacks authorization token', async () => {
      const res = await request(app).get('/api/v1/projects');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 403 when non-admin/non-staff user attempts project operations', async () => {
      const res = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${clientToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. POST /api/v1/projects (Create Project)', () => {
    it('should successfully create a valid project profile', async () => {
      const payload = {
        name: 'Delta Analytics Platform',
        code: 'PRJ-TST-01',
        clientId: testClientId,
        projectManagerId: adminUserId,
        budget: 75000,
        description: 'Enterprise data pipeline engagement',
      };

      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('PRJ-TST-01');
      expect(res.body.data.clientId).toBe(testClientId);

      testProjectId = res.body.data.id;

      // Database verification
      const dbProject = await prisma.project.findUnique({ where: { id: testProjectId } });
      expect(dbProject).not.toBeNull();
      expect(dbProject?.name).toBe('Delta Analytics Platform');
    });

    it('should reject project creation when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Incomplete Project' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject project creation with 409 when project code is duplicated', async () => {
      const payload = {
        name: 'Duplicate Code Project',
        code: 'PRJ-TST-01',
        clientId: testClientId,
      };

      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. GET /api/v1/projects (List & Search)', () => {
    it('should list projects with pagination metadata', async () => {
      const res = await request(app)
        .get('/api/v1/projects?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.total).toBeGreaterThanOrEqual(1);
    });

    it('should search projects by keyword in title/code', async () => {
      const res = await request(app)
        .get('/api/v1/projects?search=PRJ-TST-01')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.items[0].code).toBe('PRJ-TST-01');
    });
  });

  describe('4. GET /api/v1/projects/:id (Get by ID)', () => {
    it('should retrieve project details by valid ID', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testProjectId);
      expect(res.body.data.code).toBe('PRJ-TST-01');
    });

    it('should return 404 for nonexistent project UUID', async () => {
      const res = await request(app)
        .get('/api/v1/projects/00000000-0000-4000-a000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid UUID format parameter', async () => {
      const res = await request(app)
        .get('/api/v1/projects/invalid-uuid-string')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('5. PATCH /api/v1/projects/:id (Update Details)', () => {
    it('should update project name, budget, and description successfully', async () => {
      const payload = {
        name: 'Updated Delta Analytics Platform',
        budget: 95000,
        description: 'Updated scope description',
      };

      const res = await request(app)
        .patch(`/api/v1/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Delta Analytics Platform');

      // Verify database update
      const dbProject = await prisma.project.findUnique({ where: { id: testProjectId } });
      expect(Number(dbProject?.budget)).toBe(95000);
    });

    it('should return 404 when updating nonexistent project', async () => {
      const res = await request(app)
        .patch('/api/v1/projects/00000000-0000-4000-a000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Ghost Project' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('6. DELETE and Restore Lifecycle Tests', () => {
    beforeAll(async () => {
      // Create project specifically for soft-delete lifecycle testing
      const archProject = await prisma.project.create({
        data: {
          name: 'Archival Test Project',
          code: 'PRJ-ARCH-01',
          clientId: testClientId,
          status: 'ACTIVE',
        },
      });
      archivedProjectId = archProject.id;
    });

    it('should archive (soft delete) project profile with 204 No Content', async () => {
      const res = await request(app)
        .delete(`/api/v1/projects/${archivedProjectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);

      // Verify database soft-deleted state
      const dbProject = await prisma.project.findUnique({ where: { id: archivedProjectId } });
      expect(dbProject?.deletedAt).not.toBeNull();
    });

    it('should restore an archived project back to active state', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${archivedProjectId}/restore`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify database restored state
      const dbProject = await prisma.project.findUnique({ where: { id: archivedProjectId } });
      expect(dbProject?.deletedAt).toBeNull();
    });
  });
});
