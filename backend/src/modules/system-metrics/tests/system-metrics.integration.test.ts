import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/db';
import { generateAccessToken } from '../../../shared/utils/jwt';
import { SYSTEM_ROLES } from '../../../shared/constants/roles';

describe('System Metrics Integration Tests', () => {
  let adminToken: string;
  let employeeToken: string;
  let clientToken: string;

  let adminUserId: string;
  let employeeUserId: string;
  let clientUserId: string;

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
        email: 'sys_metrics_admin@example.com',
        firstName: 'SysAdmin',
        lastName: 'User',
        displayName: 'SysAdmin User',
      },
    });
    adminUserId = adminUser.id;
    await prisma.userRole.create({ data: { userId: adminUserId, roleId: adminRole.id } });

    // 3. Setup Test Employee User
    const employeeUser = await prisma.user.create({
      data: {
        email: 'sys_metrics_emp@example.com',
        firstName: 'SysEmp',
        lastName: 'User',
        displayName: 'SysEmp User',
      },
    });
    employeeUserId = employeeUser.id;
    await prisma.userRole.create({ data: { userId: employeeUserId, roleId: employeeRole.id } });

    // 4. Setup Test Client User
    const clientUser = await prisma.user.create({
      data: {
        email: 'sys_metrics_client@example.com',
        firstName: 'SysClient',
        lastName: 'User',
        displayName: 'SysClient User',
      },
    });
    clientUserId = clientUser.id;
    await prisma.userRole.create({ data: { userId: clientUserId, roleId: clientRole.id } });

    // 5. Generate Tokens
    adminToken = generateAccessToken({ sub: adminUserId, email: adminUser.email });
    employeeToken = generateAccessToken({ sub: employeeUserId, email: employeeUser.email });
    clientToken = generateAccessToken({ sub: clientUserId, email: clientUser.email });
  });

  afterAll(async () => {
    // Clean up created test user roles and users
    await prisma.userRole.deleteMany({
      where: { userId: { in: [adminUserId, employeeUserId, clientUserId].filter(Boolean) } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [adminUserId, employeeUserId, clientUserId].filter(Boolean) } },
    });
  });

  describe('Authorization and RBAC Guards', () => {
    it('should return 401 Unauthorized for unauthenticated requests without JWT token', async () => {
      const res = await request(app).get('/api/v1/system/metrics');
      expect(res.status).toBe(401);
    });

    it('should return 403 Forbidden for EMPLOYEE users', async () => {
      const res = await request(app)
        .get('/api/v1/system/metrics')
        .set('Authorization', `Bearer ${employeeToken}`);
      expect(res.status).toBe(403);
    });

    it('should return 403 Forbidden for CLIENT users', async () => {
      const res = await request(app)
        .get('/api/v1/system/metrics')
        .set('Authorization', `Bearer ${clientToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('Admin Metrics Retrieval', () => {
    it('should allow ADMIN / SUPER_ADMIN users to fetch system metrics returning 200 OK', async () => {
      const res = await request(app)
        .get('/api/v1/system/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();

      const { system, metrics } = res.body.data;

      // Verify system info structure
      expect(system).toBeDefined();
      expect(system.status).toBe('UP');
      expect(system.database).toBe('connected');
      expect(system.environment).toBeDefined();
      expect(typeof system.uptimeSeconds).toBe('number');
      expect(system.uptimeFormatted).toBeDefined();
      expect(system.timestamp).toBeDefined();

      // Verify metrics structure
      expect(metrics).toBeDefined();
      expect(metrics.users).toBeDefined();
      expect(typeof metrics.users.total).toBe('number');
      expect(typeof metrics.users.active).toBe('number');

      expect(metrics.projects).toBeDefined();
      expect(typeof metrics.projects.total).toBe('number');
      expect(typeof metrics.projects.active).toBe('number');

      expect(metrics.tasks).toBeDefined();
      expect(typeof metrics.tasks.total).toBe('number');
      expect(typeof metrics.tasks.active).toBe('number');
      expect(typeof metrics.tasks.completed).toBe('number');

      expect(metrics.documents).toBeDefined();
      expect(typeof metrics.documents.total).toBe('number');

      expect(metrics.invoices).toBeDefined();
      expect(typeof metrics.invoices.total).toBe('number');
      expect(typeof metrics.invoices.pending).toBe('number');
      expect(typeof metrics.invoices.paid).toBe('number');

      expect(metrics.clients).toBeDefined();
      expect(typeof metrics.clients.total).toBe('number');

      expect(metrics.tickets).toBeDefined();
      expect(typeof metrics.tickets.total).toBe('number');

      expect(metrics.auditLogs).toBeDefined();
      expect(typeof metrics.auditLogs.total).toBe('number');
    });

    it('should NOT leak sensitive secrets, passwords, hashes, or tokens in metrics payload', async () => {
      const res = await request(app)
        .get('/api/v1/system/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      const responseString = JSON.stringify(res.body);

      expect(responseString).not.toContain('password');
      expect(responseString).not.toContain('hash');
      expect(responseString).not.toContain('secret');
      expect(responseString).not.toContain('refreshToken');
      expect(responseString).not.toContain('DATABASE_URL');
    });
  });
});
