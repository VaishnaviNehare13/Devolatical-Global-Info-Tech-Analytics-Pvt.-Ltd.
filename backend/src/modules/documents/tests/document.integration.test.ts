import request from 'supertest';
import path from 'path';
import fs from 'fs';
import app from '../../../app';
import { prisma } from '../../../config/db';
import { generateAccessToken } from '../../../shared/utils/jwt';
import { HttpStatus } from '../../../constants/httpStatus';

describe('Documents Module Integration Tests', () => {
  let adminToken: string;
  let userToken: string;
  let adminUserId: string;

  let activeClientId: string;
  let archivedClientId: string;
  let activeProjectId: string;
  let anotherProjectId: string;
  let activeMilestoneId: string;
  let anotherProjectMilestoneId: string;

  const uploadedFilesToCleanup: string[] = [];

  beforeAll(async () => {
    // 1. Clean database tables in relational order
    await prisma.document.deleteMany();
    await prisma.task.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.project.deleteMany();
    await prisma.client.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.role.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.user.deleteMany();

    // 2. Create Roles
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
        name: 'Standard User',
        code: 'STANDARD_USER',
        type: 'CUSTOM',
        isSystem: false,
      },
    });

    // 3. Create Users
    const adminUser = await prisma.user.create({
      data: {
        firstName: 'Document',
        lastName: 'Admin',
        displayName: 'Document Admin',
        email: 'admin.doc@example.com',
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
        firstName: 'Standard',
        lastName: 'Member',
        displayName: 'Standard Member',
        email: 'user.doc@example.com',
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

    // 4. Generate Auth Tokens
    adminToken = generateAccessToken({ sub: adminUser.id, email: adminUser.email });
    userToken = generateAccessToken({ sub: normalUser.id, email: normalUser.email });

    // 5. Seed Test Entities (Client, Project, Milestones)
    const activeClient = await prisma.client.create({
      data: {
        name: 'Acme Corp',
        code: 'ACME',
        status: 'ACTIVE',
        createdById: adminUserId,
      },
    });
    activeClientId = activeClient.id;

    const archivedClient = await prisma.client.create({
      data: {
        name: 'Inactive Corp',
        code: 'INACT',
        status: 'ARCHIVED',
        deletedAt: new Date(),
        createdById: adminUserId,
      },
    });
    archivedClientId = archivedClient.id;

    const activeProject = await prisma.project.create({
      data: {
        name: 'Cloud Migration',
        code: 'CLOUD-MIG',
        status: 'ACTIVE',
        clientId: activeClientId,
        createdById: adminUserId,
      },
    });
    activeProjectId = activeProject.id;

    const anotherProject = await prisma.project.create({
      data: {
        name: 'Mobile App',
        code: 'MOB-APP',
        status: 'ACTIVE',
        clientId: activeClientId,
        createdById: adminUserId,
      },
    });
    anotherProjectId = anotherProject.id;

    const activeMilestone = await prisma.milestone.create({
      data: {
        title: 'Infrastructure Setup',
        status: 'IN_PROGRESS',
        projectId: activeProjectId,
        createdById: adminUserId,
      },
    });
    activeMilestoneId = activeMilestone.id;

    const anotherMilestone = await prisma.milestone.create({
      data: {
        title: 'iOS Release',
        status: 'IN_PROGRESS',
        projectId: anotherProjectId,
        createdById: adminUserId,
      },
    });
    anotherProjectMilestoneId = anotherMilestone.id;
  });

  afterAll(async () => {
    // 1. Clean uploaded files generated during tests
    const uploadDir = path.resolve('uploads', 'documents');
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      for (const file of files) {
        try {
          fs.unlinkSync(path.join(uploadDir, file));
        } catch (err) {
          console.error('Failed to clean up test file:', file, err);
        }
      }
    }

    // 2. Clean database tables
    await prisma.document.deleteMany();
    await prisma.task.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.project.deleteMany();
    await prisma.client.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.role.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  // Helper to record file for post-test cleanup
  const trackFileForCleanup = (fileUrl: string) => {
    if (fileUrl) {
      uploadedFilesToCleanup.push(path.resolve(fileUrl));
    }
  };

  describe('1. Authentication and Authorization Guard Tests', () => {
    it('should return 401 when request lacks authorization token', async () => {
      const res = await request(app).get('/api/v1/documents');
      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body.success).toBe(false);
    });

    it('should return 403 when non-admin user requests document operations', async () => {
      const res = await request(app)
        .get('/api/v1/documents')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(HttpStatus.FORBIDDEN);
      expect(res.body.success).toBe(false);
    });

    it('should return 403 when non-admin attempts to upload document', async () => {
      const res = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${userToken}`)
        .field('title', 'Unauthorized Upload')
        .attach('file', Buffer.from('content'), {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(HttpStatus.FORBIDDEN);
    });
  });

  describe('2. POST /api/v1/documents (Upload)', () => {
    it('should successfully upload a valid document with metadata', async () => {
      const res = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Architecture Specification')
        .field('description', 'Detailed system design and component architecture')
        .field('clientId', activeClientId)
        .field('projectId', activeProjectId)
        .field('milestoneId', activeMilestoneId)
        .attach('file', Buffer.from('PDF test file content'), {
          filename: 'architecture-spec.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Document uploaded successfully.');

      const doc = res.body.data;
      expect(doc.id).toBeDefined();
      expect(doc.title).toBe('Architecture Specification');
      expect(doc.fileName).toBe('architecture-spec.pdf');
      expect(doc.mimeType).toBe('application/pdf');
      expect(doc.fileSize).toBeGreaterThan(0);
      expect(doc.description).toBe('Detailed system design and component architecture');
      expect(doc.clientId).toBe(activeClientId);
      expect(doc.projectId).toBe(activeProjectId);
      expect(doc.milestoneId).toBe(activeMilestoneId);
      expect(doc.createdAt).toBeDefined();
      expect(doc.updatedAt).toBeDefined();

      // Ensure presentation safety: internal database audit fields are stripped
      expect(doc.createdById).toBeUndefined();
      expect(doc.updatedById).toBeUndefined();
      expect(doc.deletedAt).toBeUndefined();

      trackFileForCleanup(doc.fileUrl);

      // Verify record exists in database
      const dbDoc = await prisma.document.findUnique({ where: { id: doc.id } });
      expect(dbDoc).not.toBeNull();
      expect(dbDoc?.createdById).toBe(adminUserId);
    });

    it('should reject upload when no file is attached', async () => {
      const res = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Missing File Document');

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.success).toBe(false);
    });

    it('should reject upload when file MIME type is unsupported', async () => {
      const res = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Invalid Executable')
        .attach('file', Buffer.from('binary-exe-data'), {
          filename: 'malware.exe',
          contentType: 'application/x-msdownload',
        });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.success).toBe(false);
    });

    it('should reject upload when title is too short', async () => {
      const res = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'X') // Min length is 2
        .attach('file', Buffer.from('sample pdf'), {
          filename: 'short-title.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.success).toBe(false);
    });

    it('should reject upload when milestone does not belong to the project', async () => {
      const res = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Mismatched Milestone Doc')
        .field('projectId', activeProjectId)
        .field('milestoneId', anotherProjectMilestoneId) // Belongs to anotherProject
        .attach('file', Buffer.from('sample pdf'), {
          filename: 'mismatched.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.success).toBe(false);
    });

    it('should reject upload when referenced client is archived', async () => {
      const res = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Archived Client Doc')
        .field('clientId', archivedClientId)
        .attach('file', Buffer.from('sample pdf'), {
          filename: 'archived-client.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. GET /api/v1/documents (List & Filtering)', () => {
    let doc1Id: string;
    let doc2Id: string;

    beforeAll(async () => {
      const res1 = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Database Schema Diagram')
        .field('projectId', activeProjectId)
        .attach('file', Buffer.from('PNG content'), {
          filename: 'db-schema.png',
          contentType: 'image/png',
        });
      doc1Id = res1.body.data.id;
      trackFileForCleanup(res1.body.data.fileUrl);

      const res2 = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Sprint 1 Sprint Backlog')
        .field('projectId', anotherProjectId)
        .attach('file', Buffer.from('Spreadsheet content'), {
          filename: 'backlog.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
      doc2Id = res2.body.data.id;
      trackFileForCleanup(res2.body.data.fileUrl);
    });

    it('should list documents with pagination metadata', async () => {
      const res = await request(app)
        .get('/api/v1/documents?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toBeInstanceOf(Array);
      expect(res.body.data.total).toBeGreaterThanOrEqual(2);
      expect(res.body.data.page).toBe(1);
      expect(res.body.data.limit).toBe(10);
    });

    it('should search documents by keyword in title/filename', async () => {
      const res = await request(app)
        .get('/api/v1/documents?search=Database')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data.items.some((d: { id: string }) => d.id === doc1Id)).toBe(true);
      expect(res.body.data.items.some((d: { id: string }) => d.id === doc2Id)).toBe(false);
    });

    it('should filter documents by project ID', async () => {
      const res = await request(app)
        .get(`/api/v1/documents?projectId=${anotherProjectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(
        res.body.data.items.every((d: { projectId: string }) => d.projectId === anotherProjectId)
      ).toBe(true);
    });

    it('should sort documents by title ascending', async () => {
      const res = await request(app)
        .get('/api/v1/documents?sortField=title&sortOrder=asc')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.OK);
      const titles = res.body.data.items.map((d: { title: string }) => d.title);
      const sortedTitles = [...titles].sort();
      expect(titles).toEqual(sortedTitles);
    });
  });

  describe('4. GET /api/v1/documents/:id (Get by ID)', () => {
    let createdDocId: string;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'API Contract Specification')
        .field('description', 'OpenAPI 3.0 specification file')
        .attach('file', Buffer.from('yaml content'), {
          filename: 'openapi.txt',
          contentType: 'text/plain',
        });
      createdDocId = res.body.data.id;
      trackFileForCleanup(res.body.data.fileUrl);
    });

    it('should retrieve document details by valid ID', async () => {
      const res = await request(app)
        .get(`/api/v1/documents/${createdDocId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdDocId);
      expect(res.body.data.title).toBe('API Contract Specification');
      expect(res.body.data.description).toBe('OpenAPI 3.0 specification file');
    });

    it('should return 404 for nonexistent document UUID', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .get(`/api/v1/documents/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid UUID format parameter', async () => {
      const res = await request(app)
        .get('/api/v1/documents/invalid-uuid-format')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.success).toBe(false);
    });
  });

  describe('5. PATCH /api/v1/documents/:id (Update Metadata)', () => {
    let targetDocId: string;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Initial Document Title')
        .field('description', 'Initial description')
        .attach('file', Buffer.from('sample text'), {
          filename: 'doc.txt',
          contentType: 'text/plain',
        });
      targetDocId = res.body.data.id;
      trackFileForCleanup(res.body.data.fileUrl);
    });

    it('should update document title and description successfully', async () => {
      const res = await request(app)
        .patch(`/api/v1/documents/${targetDocId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Document Title',
          description: 'Updated document description',
        });

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Document Title');
      expect(res.body.data.description).toBe('Updated document description');
    });

    it('should reject empty update body', async () => {
      const res = await request(app)
        .patch(`/api/v1/documents/${targetDocId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 when updating nonexistent document', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const res = await request(app)
        .patch(`/api/v1/documents/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Valid New Title',
        });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('6. DELETE and Restore Lifecycle Tests', () => {
    let lifecycleDocId: string;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Lifecycle Target Document')
        .attach('file', Buffer.from('content'), {
          filename: 'lifecycle.txt',
          contentType: 'text/plain',
        });
      lifecycleDocId = res.body.data.id;
      trackFileForCleanup(res.body.data.fileUrl);
    });

    it('should archive (soft-delete) document with 204 No Content', async () => {
      const res = await request(app)
        .delete(`/api/v1/documents/${lifecycleDocId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.NO_CONTENT);

      // Verify excluded from normal get by ID
      const getRes = await request(app)
        .get(`/api/v1/documents/${lifecycleDocId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getRes.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should reject archiving an already archived document', async () => {
      const res = await request(app)
        .delete(`/api/v1/documents/${lifecycleDocId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.success).toBe(false);
    });

    it('should reject updating an archived document', async () => {
      const res = await request(app)
        .patch(`/api/v1/documents/${lifecycleDocId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Attempted Update While Archived',
        });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should successfully restore an archived document', async () => {
      const res = await request(app)
        .post(`/api/v1/documents/${lifecycleDocId}/restore`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(lifecycleDocId);

      // Verify document is visible again
      const getRes = await request(app)
        .get(`/api/v1/documents/${lifecycleDocId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getRes.status).toBe(HttpStatus.OK);
      expect(getRes.body.data.id).toBe(lifecycleDocId);
    });

    it('should reject restoring an active document', async () => {
      const res = await request(app)
        .post(`/api/v1/documents/${lifecycleDocId}/restore`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.success).toBe(false);
    });
  });

  describe('7. Secure Document Download & Client Portal Access Integration Tests', () => {
    let sampleDocId: string;
    let clientAUserToken: string;
    let clientBUserToken: string;
    let clientBOrgId: string;
    let docClientAId: string;
    let docClientBId: string;

    beforeAll(async () => {
      // 1. Create client role if needed
      let clientRole = await prisma.role.findUnique({ where: { code: 'CLIENT' } });
      if (!clientRole) {
        clientRole = await prisma.role.create({
          data: { name: 'Client Role', code: 'CLIENT', isSystem: true },
        });
      }

      // 2. Create Client Users
      const clientUserA = await prisma.user.create({
        data: {
          firstName: 'ClientA',
          lastName: 'DocUser',
          displayName: 'ClientA DocUser',
          email: 'clientA.doc@example.com',
          status: 'ACTIVE',
        },
      });
      await prisma.userRole.create({
        data: { userId: clientUserA.id, roleId: clientRole.id },
      });
      clientAUserToken = generateAccessToken({ sub: clientUserA.id, email: clientUserA.email });

      const clientUserB = await prisma.user.create({
        data: {
          firstName: 'ClientB',
          lastName: 'DocUser',
          displayName: 'ClientB DocUser',
          email: 'clientB.doc@example.com',
          status: 'ACTIVE',
        },
      });
      await prisma.userRole.create({
        data: { userId: clientUserB.id, roleId: clientRole.id },
      });
      clientBUserToken = generateAccessToken({ sub: clientUserB.id, email: clientUserB.email });

      // 3. Link Client User A to activeClientId (Acme Corp) via email matching
      await prisma.client.update({
        where: { id: activeClientId },
        data: { email: 'clientA.doc@example.com' },
      });

      // 4. Create Client Org B and link Client User B
      const clientBOrg = await prisma.client.create({
        data: {
          name: 'Beta Corp',
          code: 'BETA-DOC',
          status: 'ACTIVE',
          email: 'clientB.doc@example.com',
        },
      });
      clientBOrgId = clientBOrg.id;

      // 5. Upload document for Client A
      const uploadResA = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Client A Confidential Report')
        .field('clientId', activeClientId)
        .attach('file', Buffer.from('Client A document file binary content'), {
          filename: 'client-a-report.pdf',
          contentType: 'application/pdf',
        });
      docClientAId = uploadResA.body.data.id;
      sampleDocId = docClientAId;
      trackFileForCleanup(uploadResA.body.data.fileUrl);

      // 6. Upload document for Client B
      const uploadResB = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Client B Private Financials')
        .field('clientId', clientBOrgId)
        .attach('file', Buffer.from('Client B financial binary data'), {
          filename: 'client-b-financials.pdf',
          contentType: 'application/pdf',
        });
      docClientBId = uploadResB.body.data.id;
      trackFileForCleanup(uploadResB.body.data.fileUrl);
    });

    it('7.1 should allow Admin to download document via GET /api/v1/documents/:id/download', async () => {
      const res = await request(app)
        .get(`/api/v1/documents/${sampleDocId}/download`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/pdf');
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.text).toContain('Client A document file binary content');
    });

    it('7.2 should return 400 for invalid document UUID on download', async () => {
      const res = await request(app)
        .get('/api/v1/documents/invalid-uuid/download')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('7.3 should return 404 for non-existent document UUID on download', async () => {
      const res = await request(app)
        .get('/api/v1/documents/00000000-0000-0000-0000-000000000000/download')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('7.4 should allow Client A to list their own organization documents via Client Portal', async () => {
      const res = await request(app)
        .get('/api/v1/client-portal/documents')
        .set('Authorization', `Bearer ${clientAUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const docIds = res.body.data.map((d: any) => d.id);
      expect(docIds).toContain(docClientAId);
      expect(docIds).not.toContain(docClientBId);
    });

    it('7.5 should allow Client A to download their own organization document', async () => {
      const res = await request(app)
        .get(`/api/v1/client-portal/documents/${docClientAId}/download`)
        .set('Authorization', `Bearer ${clientAUserToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/pdf');
      expect(res.text).toContain('Client A document file binary content');
    });

    it('7.6 should DENY Client A attempting to download Client B document with 404', async () => {
      const res = await request(app)
        .get(`/api/v1/client-portal/documents/${docClientBId}/download`)
        .set('Authorization', `Bearer ${clientAUserToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('7.7 should DENY Client B attempting to download Client A document with 404', async () => {
      const res = await request(app)
        .get(`/api/v1/client-portal/documents/${docClientAId}/download`)
        .set('Authorization', `Bearer ${clientBUserToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
