import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/db';
import { generateAccessToken } from '../../../shared/utils/jwt';
import { Prisma, AuditModule, AuditAction, AuditStatus, AuditSeverity } from '@prisma/client';
import { HttpStatus } from '../../../constants/httpStatus';

describe('Audit Logs Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let adminUserId: string;
  let log1Id: string;
  let log2Id: string;
  let log3Id: string;

  beforeAll(async () => {
    // 1. Clean database tables in order of dependency constraints
    await prisma.auditLog.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.role.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.user.deleteMany();

    // 2. Create roles required for authentication/authorization
    const adminRole = await prisma.role.create({
      data: {
        name: 'Super Admin',
        code: 'SUPER_ADMIN',
        type: 'SYSTEM',
        isSystem: true,
      },
    });

    const userRole = await prisma.role.create({
      data: {
        name: 'Custom User',
        code: 'CUSTOM_USER',
        type: 'CUSTOM',
        isSystem: false,
      },
    });

    // 3. Create test users
    const adminUser = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        displayName: 'Admin User',
        email: 'admin.audit@example.com',
        status: 'ACTIVE',
      },
    });
    adminUserId = adminUser.id;

    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
        isActive: true,
      },
    });

    const normalUser = await prisma.user.create({
      data: {
        firstName: 'Normal',
        lastName: 'User',
        displayName: 'Normal User',
        email: 'normal.audit@example.com',
        status: 'ACTIVE',
      },
    });

    await prisma.userRole.create({
      data: {
        userId: normalUser.id,
        roleId: userRole.id,
        isActive: true,
      },
    });

    // 4. Generate JWT tokens
    adminToken = generateAccessToken({ sub: adminUser.id, email: adminUser.email });
    userToken = generateAccessToken({ sub: normalUser.id, email: normalUser.email });

    // 5. Seed diverse Audit Log dataset (Wait 10ms between creations to ensure stable creation order)
    const log1 = await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        module: AuditModule.AUTH,
        action: AuditAction.LOGIN,
        status: AuditStatus.SUCCESS,
        severity: AuditSeverity.INFO,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Chrome/120.0',
        requestId: 'req-auth-100',
        resourceName: 'AuthToken',
      },
    });
    log1Id = log1.id;

    await new Promise((resolve) => setTimeout(resolve, 10));

    const log2 = await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        module: AuditModule.USERS,
        action: AuditAction.CREATE,
        status: AuditStatus.SUCCESS,
        severity: AuditSeverity.WARNING,
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0 Firefox/121.0',
        requestId: 'req-user-200',
        resourceName: 'Vaishnavi User Profile',
        oldValues: Prisma.DbNull,
        newValues: { status: 'ACTIVE', role: 'ADMIN' },
      },
    });
    log2Id = log2.id;

    await new Promise((resolve) => setTimeout(resolve, 10));

    const log3 = await prisma.auditLog.create({
      data: {
        userId: null,
        module: AuditModule.ROLES,
        action: AuditAction.UPDATE,
        status: AuditStatus.FAILED,
        severity: AuditSeverity.CRITICAL,
        ipAddress: '10.0.0.5',
        userAgent: 'Safari/17.2',
        requestId: 'req-role-300',
        resourceName: 'Manager Role Configuration',
        metadata: { reason: 'Unique constraint on code violated' },
      },
    });
    log3Id = log3.id;
  });

  afterAll(async () => {
    // Clean up tables and disconnect DB client
    await prisma.auditLog.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.role.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('1. Authentication Guard Tests', () => {
    it('should return 401 for requests without an authorization header', async () => {
      const res = await request(app).get('/api/v1/audit-logs');
      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.header['content-type']).toMatch(/json/);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for requests with an invalid token format', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Authorization Guard Tests', () => {
    it('should return 403 for requests from users without admin roles', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(HttpStatus.FORBIDDEN);
      expect(res.body.success).toBe(false);
    });

    it('should allow access to requests from users with admin roles', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.success).toBe(true);
    });
  });

  describe('3. Request Parameter Validation Tests', () => {
    it('should return 400 when query parameter page is negative', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs?page=-1')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when query parameter limit exceeds max limit', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs?limit=150')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 when sorting field is not supported', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs?sortField=ipAddress')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 when dateFrom has an invalid format', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs?dateFrom=2026/07/29')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 when fetching record with an invalid UUID parameter format', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs/invalid-uuid-format')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 when query contains unknown parameters', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs?unknownQueryParam=attack')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('4. GET List Endpoint Queries & Search Tests', () => {
    it('should fetch audit logs without filter limits and return correct contract structure', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Audit logs list retrieved successfully.');
      expect(res.body.data.items).toHaveLength(3);

      const pagination = res.body.data.pagination;
      expect(pagination.total).toBe(3);
      expect(pagination.page).toBe(1);
      expect(pagination.limit).toBe(20);
      expect(pagination.totalPages).toBe(1);
      expect(pagination.hasNextPage).toBe(false);
      expect(pagination.hasPreviousPage).toBe(false);
    });

    it('should filter audit logs by module', async () => {
      const res = await request(app)
        .get(`/api/v1/audit-logs?module=${AuditModule.AUTH}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].id).toBe(log1Id);
    });

    it('should filter audit logs by severity', async () => {
      const res = await request(app)
        .get(`/api/v1/audit-logs?severity=${AuditSeverity.CRITICAL}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].id).toBe(log3Id);
    });

    it('should filter audit logs by userId', async () => {
      const res = await request(app)
        .get(`/api/v1/audit-logs?userId=${adminUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data.items).toHaveLength(2);
    });

    it('should perform case-insensitive keyword search on resourceName', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs?search=vaishnavi')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].id).toBe(log2Id);
    });

    it('should sort logs correctly in ascending order', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs?sortField=createdAt&sortOrder=asc')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data.items[0].id).toBe(log1Id);
      expect(res.body.data.items[1].id).toBe(log2Id);
      expect(res.body.data.items[2].id).toBe(log3Id);
    });

    it('should sort logs correctly in descending order (default order)', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs?sortField=createdAt&sortOrder=desc')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data.items[0].id).toBe(log3Id);
      expect(res.body.data.items[1].id).toBe(log2Id);
      expect(res.body.data.items[2].id).toBe(log1Id);
    });

    it('should filter logs inside date boundaries', async () => {
      const now = new Date();
      const past = new Date(now.getTime() - 60000); // 1 minute ago
      const future = new Date(now.getTime() + 60000); // 1 minute in the future

      const res = await request(app)
        .get(`/api/v1/audit-logs?dateFrom=${past.toISOString()}&dateTo=${future.toISOString()}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data.items).toHaveLength(3);
    });
  });

  describe('5. GET By ID Endpoint Tests', () => {
    it('should retrieve a single audit log with relations successfully', async () => {
      const res = await request(app)
        .get(`/api/v1/audit-logs/${log1Id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Audit log details retrieved successfully.');
      expect(res.body.data.id).toBe(log1Id);
      expect(res.body.data.user.id).toBe(adminUserId);
    });

    it('should return 404 when audit log ID is valid but does not exist in the database', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
      expect(res.body.success).toBe(false);
    });
  });

  describe('6. Empty Database Configuration Edge Tests', () => {
    beforeAll(async () => {
      // Temporarily clear only audit logs to simulate empty database queries
      await prisma.auditLog.deleteMany();
    });

    it('should return 200 OK with empty items and zero total metadata on empty database', async () => {
      const res = await request(app)
        .get('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.pagination.total).toBe(0);
      expect(res.body.data.pagination.totalPages).toBe(1);
    });
  });

  describe('7. Read-only and Immutable Enforcement Route Tests', () => {
    it('should reject POST mutations returning 404', async () => {
      const res = await request(app)
        .post('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ module: 'USERS' });
      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should reject PATCH mutations returning 404', async () => {
      const res = await request(app)
        .patch(`/api/v1/audit-logs/${log2Id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ module: 'USERS' });
      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should reject DELETE mutations returning 404', async () => {
      const res = await request(app)
        .delete(`/api/v1/audit-logs/${log2Id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
