import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/db';
import { generateAccessToken } from '../../../shared/utils/jwt';

describe('Careers & Recruitment Integration Tests', () => {
  let adminToken: string;
  let employeeToken: string;
  let clientToken: string;

  let activeJobId: string;
  let inactiveJobId: string;
  let submittedApplicationId: string;

  beforeAll(async () => {
    // 1. Fetch seeded users and generate tokens
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@devolatical.com' } });
    const employeeUser = await prisma.user.findUnique({ where: { email: 'employee@devolatical.com' } });
    const clientUser = await prisma.user.findUnique({ where: { email: 'client@devolatical.com' } });

    if (adminUser) adminToken = generateAccessToken({ sub: adminUser.id, email: adminUser.email });
    if (employeeUser) employeeToken = generateAccessToken({ sub: employeeUser.id, email: employeeUser.email });
    if (clientUser) clientToken = generateAccessToken({ sub: clientUser.id, email: clientUser.email });

    // 2. Ensure test job postings exist
    const activeJob = await prisma.job.create({
      data: {
        title: 'Integration Test Data Engineer',
        department: 'Data Analytics',
        location: 'Mumbai',
        employmentType: 'FULL_TIME',
        salaryRange: 'Competitive',
        description: 'Building automated test pipelines',
        requirements: 'TypeScript and Node.js',
        status: 'ACTIVE',
      },
    });
    activeJobId = activeJob.id;

    const inactiveJob = await prisma.job.create({
      data: {
        title: 'Integration Test Inactive Engineer',
        department: 'IT Infrastructure',
        location: 'Remote',
        employmentType: 'CONTRACT',
        salaryRange: 'Competitive',
        description: 'Archived test position',
        status: 'INACTIVE',
      },
    });
    inactiveJobId = inactiveJob.id;
  });

  afterAll(async () => {
    if (submittedApplicationId) {
      await prisma.jobApplication.deleteMany({ where: { id: submittedApplicationId } });
    }
    if (activeJobId) {
      await prisma.job.deleteMany({ where: { id: activeJobId } });
    }
    if (inactiveJobId) {
      await prisma.job.deleteMany({ where: { id: inactiveJobId } });
    }
  });

  describe('Public Job & Application Endpoints', () => {
    it('A. should allow public users to list active jobs', async () => {
      const res = await request(app).get('/api/v1/careers/jobs');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toBeDefined();
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);

      const found = res.body.data.items.find((j: any) => j.id === activeJobId);
      expect(found).toBeDefined();
      expect(found.title).toBe('Integration Test Data Engineer');
    });

    it('B. should allow public users to submit job applications', async () => {
      const res = await request(app)
        .post(`/api/v1/careers/jobs/${activeJobId}/applications`)
        .field('applicantName', 'Candidate Integration Tester')
        .field('email', 'candidate_test@example.com')
        .field('phone', '+91 9876543210')
        .field('portfolioUrl', 'https://github.com/candidatetest')
        .field('coverMessage', 'I am interested in building scalable data pipelines.');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.applicantName).toBe('Candidate Integration Tester');
      expect(res.body.data.email).toBe('candidate_test@example.com');

      submittedApplicationId = res.body.data.id;
    });

    it('C. should reject applications with invalid email format', async () => {
      const res = await request(app)
        .post(`/api/v1/careers/jobs/${activeJobId}/applications`)
        .send({
          applicantName: 'Invalid Tester',
          email: 'invalid-email-string',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('D. should reject applications for non-existent or inactive jobs', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const resNonExistent = await request(app)
        .post(`/api/v1/careers/jobs/${fakeUuid}/applications`)
        .send({
          applicantName: 'Fake Tester',
          email: 'fake@example.com',
        });

      expect(resNonExistent.status).toBe(404);

      const resInactive = await request(app)
        .post(`/api/v1/careers/jobs/${inactiveJobId}/applications`)
        .send({
          applicantName: 'Inactive Tester',
          email: 'inactive@example.com',
        });

      expect(resInactive.status).toBe(400);
    });
  });

  describe('RBAC & Administrative Recruitment Operations', () => {
    it('J. should return 401 Unauthorized for unauthenticated GET /api/v1/careers/applications', async () => {
      const res = await request(app).get('/api/v1/careers/applications');
      expect(res.status).toBe(401);
    });

    it('H. should return 403 Forbidden for EMPLOYEE users accessing GET /api/v1/careers/applications', async () => {
      const res = await request(app)
        .get('/api/v1/careers/applications')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(403);
    });

    it('I. should return 403 Forbidden for CLIENT users accessing GET /api/v1/careers/applications', async () => {
      const res = await request(app)
        .get('/api/v1/careers/applications')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(403);
    });

    it('E. should allow ADMIN / SUPER_ADMIN to list candidate applications', async () => {
      const res = await request(app)
        .get('/api/v1/careers/applications?search=Candidate Integration Tester')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toBeDefined();
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);

      const found = res.body.data.items.find((a: any) => a.id === submittedApplicationId);
      expect(found).toBeDefined();
    });

    it('F. should allow ADMIN to view application details', async () => {
      const res = await request(app)
        .get(`/api/v1/careers/applications/${submittedApplicationId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(submittedApplicationId);
      expect(res.body.data.portfolioUrl).toBe('https://github.com/candidatetest');
    });

    it('G. should allow ADMIN to update candidate application status and notes', async () => {
      const updatePayload = {
        status: 'SHORTLISTED',
        notes: 'Passed initial screening call',
      };

      const res = await request(app)
        .patch(`/api/v1/careers/applications/${submittedApplicationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('SHORTLISTED');
      expect(res.body.data.notes).toBe('Passed initial screening call');
    });

    it('K. should allow ADMIN to create, update, and archive job postings', async () => {
      // 1. Create Job
      const createRes = await request(app)
        .post('/api/v1/careers/jobs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Created Test Job',
          department: 'Architecture',
          location: 'Mumbai',
          employmentType: 'FULL_TIME',
          salaryRange: '100k',
          description: 'Created by integration test suite',
          status: 'ACTIVE',
        });

      expect(createRes.status).toBe(201);
      const createdJobId = createRes.body.data.id;

      // 2. Update Job
      const updateRes = await request(app)
        .patch(`/api/v1/careers/jobs/${createdJobId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Updated Test Job Title',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.title).toBe('Admin Updated Test Job Title');

      // 3. Archive Job
      const deleteRes = await request(app)
        .delete(`/api/v1/careers/jobs/${createdJobId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(204);

      await prisma.job.deleteMany({ where: { id: createdJobId } });
    });
  });
});
