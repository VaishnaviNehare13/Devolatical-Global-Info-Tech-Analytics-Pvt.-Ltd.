import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/db';
import { generateAccessToken } from '../../../shared/utils/jwt';
import { SYSTEM_ROLES } from '../../../shared/constants/roles';

describe('Milestone Client Deliverable Review & Approval Integration Tests', () => {
  let adminToken: string;
  let clientAToken: string;

  let adminUserId: string;
  let clientAUserId: string;
  let clientBUserId: string;

  let clientAOrgId: string;
  let clientBOrgId: string;

  let projectAId: string;
  let projectBId: string;

  let milestoneAId: string;
  let milestoneBId: string;

  beforeAll(async () => {
    // 1. Setup Roles matching SYSTEM_ROLES constants safely
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

    // Ensure role name matches SYSTEM_ROLES name expected by auth middleware
    if (adminRole.name !== SYSTEM_ROLES.ADMIN) {
      adminRole = await prisma.role.update({
        where: { id: adminRole.id },
        data: { name: SYSTEM_ROLES.ADMIN },
      });
    }
    if (clientRole.name !== SYSTEM_ROLES.CLIENT) {
      clientRole = await prisma.role.update({
        where: { id: clientRole.id },
        data: { name: SYSTEM_ROLES.CLIENT },
      });
    }

    // 2. Setup Test Users
    const adminUser = await prisma.user.create({
      data: {
        email: 'ms_review_admin@example.com',
        firstName: 'MsAdmin',
        lastName: 'User',
        displayName: 'MsAdmin User',
      },
    });
    adminUserId = adminUser.id;
    await prisma.userRole.create({ data: { userId: adminUserId, roleId: adminRole.id } });

    const clientAUser = await prisma.user.create({
      data: {
        email: 'ms_review_clientA@example.com',
        firstName: 'MsClientA',
        lastName: 'User',
        displayName: 'MsClientA User',
      },
    });
    clientAUserId = clientAUser.id;
    await prisma.userRole.create({ data: { userId: clientAUserId, roleId: clientRole.id } });

    const clientBUser = await prisma.user.create({
      data: {
        email: 'ms_review_clientB@example.com',
        firstName: 'MsClientB',
        lastName: 'User',
        displayName: 'MsClientB User',
      },
    });
    clientBUserId = clientBUser.id;
    await prisma.userRole.create({ data: { userId: clientBUserId, roleId: clientRole.id } });

    // 3. Setup Client Orgs
    const clientAOrg = await prisma.client.create({
      data: {
        name: 'Ms Review Client Org A',
        code: 'CLT-MSR-A',
        email: 'ms_review_clientA@example.com',
        accountManagerId: clientAUserId,
      },
    });
    clientAOrgId = clientAOrg.id;

    const clientBOrg = await prisma.client.create({
      data: {
        name: 'Ms Review Client Org B',
        code: 'CLT-MSR-B',
        email: 'ms_review_clientB@example.com',
        accountManagerId: clientBUserId,
      },
    });
    clientBOrgId = clientBOrg.id;

    // 4. Setup Projects
    const projectA = await prisma.project.create({
      data: {
        name: 'Ms Review Project A',
        code: 'PRJ-MSR-A',
        clientId: clientAOrgId,
        projectManagerId: adminUserId,
      },
    });
    projectAId = projectA.id;

    const projectB = await prisma.project.create({
      data: {
        name: 'Ms Review Project B',
        code: 'PRJ-MSR-B',
        clientId: clientBOrgId,
        projectManagerId: adminUserId,
      },
    });
    projectBId = projectB.id;

    // 5. Setup Milestones
    const milestoneA = await prisma.milestone.create({
      data: {
        title: 'Phase 1: Core Lakehouse Deployment',
        description: 'ETL Pipelines & Delta Lake Schema setup',
        status: 'IN_PROGRESS',
        reviewStatus: 'NOT_SUBMITTED',
        projectId: projectAId,
        createdById: adminUserId,
      },
    });
    milestoneAId = milestoneA.id;

    const milestoneB = await prisma.milestone.create({
      data: {
        title: 'Phase 1: Client B Data Warehouse',
        description: 'Warehouse setup for Org B',
        status: 'IN_PROGRESS',
        reviewStatus: 'NOT_SUBMITTED',
        projectId: projectBId,
        createdById: adminUserId,
      },
    });
    milestoneBId = milestoneB.id;

    // 6. Generate Tokens
    adminToken = generateAccessToken({ sub: adminUserId, email: adminUser.email });
    clientAToken = generateAccessToken({ sub: clientAUserId, email: clientAUser.email });
  });

  afterAll(async () => {
    const milestoneIds = [milestoneAId, milestoneBId].filter(Boolean);
    const projectIds = [projectAId, projectBId].filter(Boolean);
    const clientIds = [clientAOrgId, clientBOrgId].filter(Boolean);
    const userIds = [adminUserId, clientAUserId, clientBUserId].filter(Boolean);

    if (milestoneIds.length) {
      await prisma.notification.deleteMany({ where: { entityId: { in: milestoneIds } } });
      await prisma.milestone.deleteMany({ where: { id: { in: milestoneIds } } });
    }
    if (projectIds.length) await prisma.project.deleteMany({ where: { id: { in: projectIds } } });
    if (clientIds.length) await prisma.client.deleteMany({ where: { id: { in: clientIds } } });
    if (userIds.length) await prisma.userRole.deleteMany({ where: { userId: { in: userIds } } });
    if (userIds.length) await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  });

  describe('1. Submit Milestone for Review (Staff Action)', () => {
    it('should allow Staff to submit a NOT_SUBMITTED milestone for client review and dispatch notification', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${projectAId}/milestones/${milestoneAId}/submit-review`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reviewStatus).toBe('SUBMITTED');
      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.data.submittedForReviewAt).not.toBeNull();
      expect(res.body.data.submittedById).toBe(adminUserId);

      // Verify Notification creation
      const notif = await prisma.notification.findFirst({
        where: {
          entityId: milestoneAId,
          title: 'Milestone Ready for Review',
          userId: clientAUserId,
        },
      });
      expect(notif).not.toBeNull();
      expect(notif?.message).toContain('submitted for deliverable review');
    });

    it('should DENY submitting an unauthenticated request with 401', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${projectAId}/milestones/${milestoneAId}/submit-review`);

      expect(res.status).toBe(401);
    });
  });

  describe('2. Client Revision Request Workflow', () => {
    it('should allow Client A to request a revision on their SUBMITTED milestone and notify engineering', async () => {
      const res = await request(app)
        .post(`/api/v1/client-portal/milestones/${milestoneAId}/request-revision`)
        .set('Authorization', `Bearer ${clientAToken}`)
        .send({ revisionNotes: 'Please optimize query performance on Phase 1 pipeline.' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reviewStatus).toBe('REVISION_REQUESTED');
      expect(res.body.data.status).toBe('IN_PROGRESS');
      expect(res.body.data.revisionNotes).toBe('Please optimize query performance on Phase 1 pipeline.');

      // Verify Notification creation for engineering/admin
      const notif = await prisma.notification.findFirst({
        where: {
          entityId: milestoneAId,
          title: 'Milestone Revision Requested',
        },
      });
      expect(notif).not.toBeNull();
      expect(notif?.message).toContain('Feedback: Please optimize query performance on Phase 1 pipeline.');
    });

    it('should REJECT revision request with missing or short notes (< 5 chars)', async () => {
      const res = await request(app)
        .post(`/api/v1/client-portal/milestones/${milestoneAId}/request-revision`)
        .set('Authorization', `Bearer ${clientAToken}`)
        .send({ revisionNotes: 'Bad' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should allow Staff to re-submit a REVISION_REQUESTED milestone back to SUBMITTED', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${projectAId}/milestones/${milestoneAId}/submit-review`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reviewStatus).toBe('SUBMITTED');
      expect(res.body.data.status).toBe('COMPLETED');
    });
  });

  describe('3. Client Approval Workflow', () => {
    it('should allow Client A to approve their SUBMITTED milestone and dispatch approval notification', async () => {
      const res = await request(app)
        .post(`/api/v1/client-portal/milestones/${milestoneAId}/approve`)
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reviewStatus).toBe('APPROVED');
      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.data.approvedAt).not.toBeNull();
      expect(res.body.data.approvedById).toBe(clientAUserId);

      // Verify Notification creation
      const notif = await prisma.notification.findFirst({
        where: {
          entityId: milestoneAId,
          title: 'Milestone Approved by Client',
        },
      });
      expect(notif).not.toBeNull();
    });

    it('should DENY Client A approving an already APPROVED milestone with 400', async () => {
      const res = await request(app)
        .post(`/api/v1/client-portal/milestones/${milestoneAId}/approve`)
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should DENY Staff submitting an already APPROVED milestone with 400', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${projectAId}/milestones/${milestoneAId}/submit-review`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('4. Tenant Isolation Enforcement', () => {
    it('should DENY Client A from approving Client B milestone with 404 and NOT create notifications', async () => {
      const initialNotifCount = await prisma.notification.count({ where: { entityId: milestoneBId } });

      const res = await request(app)
        .post(`/api/v1/client-portal/milestones/${milestoneBId}/approve`)
        .set('Authorization', `Bearer ${clientAToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      const postNotifCount = await prisma.notification.count({ where: { entityId: milestoneBId } });
      expect(postNotifCount).toBe(initialNotifCount);
    });

    it('should DENY Client A from requesting revision on Client B milestone with 404 and NOT create notifications', async () => {
      const initialNotifCount = await prisma.notification.count({ where: { entityId: milestoneBId } });

      const res = await request(app)
        .post(`/api/v1/client-portal/milestones/${milestoneBId}/request-revision`)
        .set('Authorization', `Bearer ${clientAToken}`)
        .send({ revisionNotes: 'Unauthorized change attempt' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      const postNotifCount = await prisma.notification.count({ where: { entityId: milestoneBId } });
      expect(postNotifCount).toBe(initialNotifCount);
    });
  });
});
