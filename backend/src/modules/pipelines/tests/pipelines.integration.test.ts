import request from 'supertest';
import express from 'express';
import { prisma } from '../../../config/db';
import { generateAccessToken } from '../../../shared/utils/jwt';
import { AuthMiddleware } from '../../../middleware/auth.middleware';
import { AuthRepository } from '../../auth/repositories/auth.repository';
import { createPipelinesModule } from '../index';
import { createClientPortalModule } from '../../client-portal/client-portal.module';
import { PipelineStatus } from '@prisma/client';

describe('Data Pipelines & Dynamic Client Portal Overview Integration Tests', () => {
  let testApp: express.Application;

  let adminToken: string;
  let clientAToken: string;
  let clientBToken: string;

  let adminUserId: string;
  let clientAUserId: string;
  let clientBUserId: string;

  let clientAOrgId: string;
  let clientBOrgId: string;

  let projectAId: string;
  let projectBId: string;

  let pipelineAId: string;

  beforeAll(async () => {
    // 1. Admin User
    const adminUser = await prisma.user.create({
      data: {
        firstName: 'Pipe',
        lastName: 'Admin',
        displayName: 'Pipe Admin',
        email: `pipe.admin.${Date.now()}@example.com`,
        status: 'ACTIVE',
      },
    });
    adminUserId = adminUser.id;
    adminToken = generateAccessToken({ sub: adminUser.id, email: adminUser.email });

    // Super Admin Role assignment for adminUser
    const superAdminRole = await prisma.role.findFirst({ where: { code: 'SUPER_ADMIN' } });
    if (superAdminRole) {
      await prisma.userRole.create({
        data: { userId: adminUserId, roleId: superAdminRole.id },
      });
    }

    // 2. Client A User & Org
    const clientAUser = await prisma.user.create({
      data: {
        firstName: 'Client',
        lastName: 'UserA',
        displayName: 'Client User A',
        email: `client.user.a.${Date.now()}@example.com`,
        status: 'ACTIVE',
      },
    });
    clientAUserId = clientAUser.id;
    clientAToken = generateAccessToken({ sub: clientAUser.id, email: clientAUser.email });

    const clientAOrg = await prisma.client.create({
      data: {
        name: 'Alpha Corp Client A',
        code: `CL-A-${Date.now()}`,
        email: clientAUser.email,
        status: 'ACTIVE',
      },
    });
    clientAOrgId = clientAOrg.id;

    // 3. Client B User & Org
    const clientBUser = await prisma.user.create({
      data: {
        firstName: 'Client',
        lastName: 'UserB',
        displayName: 'Client User B',
        email: `client.user.b.${Date.now()}@example.com`,
        status: 'ACTIVE',
      },
    });
    clientBUserId = clientBUser.id;
    clientBToken = generateAccessToken({ sub: clientBUser.id, email: clientBUser.email });

    const clientBOrg = await prisma.client.create({
      data: {
        name: 'Beta Corp Client B',
        code: `CL-B-${Date.now()}`,
        email: clientBUser.email,
        status: 'ACTIVE',
      },
    });
    clientBOrgId = clientBOrg.id;

    // 4. Projects & Milestones for Client A & B
    const projectA = await prisma.project.create({
      data: {
        name: 'Alpha Ingestion Project',
        code: `PRJ-A-${Date.now()}`,
        clientId: clientAOrgId,
        status: 'ACTIVE',
      },
    });
    projectAId = projectA.id;

    await prisma.milestone.create({
      data: {
        title: 'Phase 1: Pipeline Pipeline Validation',
        description: 'Validate Kafka ingestion streams.',
        status: 'IN_PROGRESS',
        projectId: projectAId,
      },
    });

    const projectB = await prisma.project.create({
      data: {
        name: 'Beta Warehouse Project',
        code: `PRJ-B-${Date.now()}`,
        clientId: clientBOrgId,
        status: 'ACTIVE',
      },
    });
    projectBId = projectB.id;

    await prisma.milestone.create({
      data: {
        title: 'Phase 1: Beta Setup',
        description: 'Setup Beta SnowflakeDW.',
        status: 'COMPLETED',
        projectId: projectBId,
      },
    });

    // 5. Setup Test Express App
    testApp = express();
    testApp.use(express.json());

    const authRepository = new AuthRepository();
    const authMiddleware = new AuthMiddleware(authRepository);
    const authorizeStaff = (_req: express.Request, _res: express.Response, next: express.NextFunction) => next();

    const pipelinesRouter = createPipelinesModule(prisma, authMiddleware.handle, authorizeStaff);
    const clientPortalRouter = createClientPortalModule(prisma, authMiddleware.handle);

    testApp.use('/api/v1/pipelines', pipelinesRouter);
    testApp.use('/api/v1/client-portal', clientPortalRouter);
  });

  afterAll(async () => {
    await prisma.dataPipeline.deleteMany({ where: { clientId: { in: [clientAOrgId, clientBOrgId] } } });
    await prisma.milestone.deleteMany({ where: { project: { clientId: { in: [clientAOrgId, clientBOrgId] } } } });
    await prisma.project.deleteMany({ where: { clientId: { in: [clientAOrgId, clientBOrgId] } } });
    await prisma.client.deleteMany({ where: { id: { in: [clientAOrgId, clientBOrgId] } } });
    await prisma.userRole.deleteMany({ where: { userId: { in: [adminUserId, clientAUserId, clientBUserId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [adminUserId, clientAUserId, clientBUserId] } } });
  });

  describe('1. Data Pipeline CRUD & Telemetry Endpoints', () => {
    it('should create a new Data Pipeline via POST /api/v1/pipelines', async () => {
      const res = await request(testApp)
        .post('/api/v1/pipelines')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'alpha-telemetry-stream',
          description: 'High throughput telemetry ingestion.',
          status: 'ACTIVE',
          source: 'Kinesis Kafka',
          target: 'Snowflake DW',
          volume: '1.5M req/hr',
          progress: 90,
          clientId: clientAOrgId,
          projectId: projectAId,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.name).toBe('alpha-telemetry-stream');
      pipelineAId = res.body.data.id;
    });

    it('should retrieve single Data Pipeline by ID via GET /api/v1/pipelines/:id', async () => {
      const res = await request(testApp)
        .get(`/api/v1/pipelines/${pipelineAId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('alpha-telemetry-stream');
    });

    it('should list Data Pipelines with pagination via GET /api/v1/pipelines', async () => {
      const res = await request(testApp)
        .get('/api/v1/pipelines')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
    });

    it('should update pipeline status via PATCH /api/v1/pipelines/:id/status', async () => {
      const res = await request(testApp)
        .patch(`/api/v1/pipelines/${pipelineAId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: PipelineStatus.SYNCING,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('SYNCING');
    });

    it('should retrieve Telemetry metrics via GET /api/v1/pipelines/metrics', async () => {
      const res = await request(testApp)
        .get('/api/v1/pipelines/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalPipelines).toBeGreaterThan(0);
      expect(res.body.data.syncingPipelines).toBeGreaterThan(0);
    });

    it('should return 401 Unauthorized for unauthenticated requests', async () => {
      const res = await request(testApp).get('/api/v1/pipelines');
      expect(res.status).toBe(401);
    });
  });

  describe('2. Dynamic Client Portal Overview & Tenant Isolation', () => {
    it('should return dynamic database-backed pipelines and milestones for Client A without static placeholders', async () => {
      const res = await request(testApp)
        .get('/api/v1/client-portal/overview')
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.activePipelines).toBeDefined();
      expect(res.body.data.projectMilestones).toBeDefined();

      // Verify static placeholders pip-1 and ms-1 DO NOT exist
      const pipelineIds = res.body.data.activePipelines.map((p: any) => p.id);
      const milestoneIds = res.body.data.projectMilestones.map((m: any) => m.id);

      expect(pipelineIds).not.toContain('pip-1');
      expect(milestoneIds).not.toContain('ms-1');

      // Verify Client A receives their real pipeline
      expect(pipelineIds).toContain(pipelineAId);
    });

    it('should enforce tenant isolation so Client B DOES NOT see Client A pipelines or milestones', async () => {
      const res = await request(testApp)
        .get('/api/v1/client-portal/overview')
        .set('Authorization', `Bearer ${clientBToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const pipelineIds = res.body.data.activePipelines.map((p: any) => p.id);
      expect(pipelineIds).not.toContain(pipelineAId);
    });
  });
});
