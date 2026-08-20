import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/db';
import { generateAccessToken } from '../../../shared/utils/jwt';

describe('System Metrics Integration Tests', () => {
  let adminToken: string;
  let employeeToken: string;
  let clientToken: string;

  beforeAll(async () => {
    // Fetch seeded users by email
    let adminUser = await prisma.user.findUnique({ where: { email: 'admin@devolatical.com' } });
    if (!adminUser) {
      adminUser = await prisma.user.findFirst({
        where: { assignedRoles: { some: { role: { code: 'SUPER_ADMIN' } } } },
      });
    }

    let employeeUser = await prisma.user.findUnique({ where: { email: 'employee@devolatical.com' } });
    if (!employeeUser) {
      employeeUser = await prisma.user.findFirst({
        where: { assignedRoles: { some: { role: { code: 'EMPLOYEE' } } } },
      });
    }

    let clientUser = await prisma.user.findUnique({ where: { email: 'client@devolatical.com' } });
    if (!clientUser) {
      clientUser = await prisma.user.findFirst({
        where: { assignedRoles: { some: { role: { code: 'CLIENT' } } } },
      });
    }

    if (adminUser) {
      adminToken = generateAccessToken({ sub: adminUser.id, email: adminUser.email });
    }
    if (employeeUser) {
      employeeToken = generateAccessToken({ sub: employeeUser.id, email: employeeUser.email });
    }
    if (clientUser) {
      clientToken = generateAccessToken({ sub: clientUser.id, email: clientUser.email });
    }
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
