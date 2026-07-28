import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/db';
import { generateAccessToken } from '../../../shared/utils/jwt';
import { Module, Resource, Action } from '@prisma/client';
import { HttpStatus } from '../../../constants/httpStatus';

describe('Role-Permission Mapping Integration Tests', () => {
  let adminToken: string;
  let userToken: string;

  let activeRoleId: string;
  let protectedRoleId: string;
  let inactiveRoleId: string;

  let permissionId1: string;
  let permissionId2: string;
  let inactivePermissionId: string;

  beforeAll(async () => {
    // 1. Clean database
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

    const customRole = await prisma.role.create({
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
        email: 'admin.rp.test@example.com',
        status: 'ACTIVE',
      },
    });

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
        email: 'normal.rp.test@example.com',
        status: 'ACTIVE',
      },
    });

    await prisma.userRole.create({
      data: {
        userId: normalUser.id,
        roleId: customRole.id,
        isActive: true,
      },
    });

    // 4. Generate JWT tokens
    adminToken = generateAccessToken({ sub: adminUser.id, email: adminUser.email });
    userToken = generateAccessToken({ sub: normalUser.id, email: normalUser.email });

    // 5. Create test Roles
    const activeRole = await prisma.role.create({
      data: {
        name: 'Active Test Role',
        code: 'ACTIVE_ROLE',
        type: 'CUSTOM',
        isActive: true,
      },
    });
    activeRoleId = activeRole.id;

    const protectedRole = await prisma.role.create({
      data: {
        name: 'Protected Test Role',
        code: 'PROTECTED_ROLE',
        type: 'SYSTEM',
        isSystem: true,
        isActive: true,
      },
    });
    protectedRoleId = protectedRole.id;

    const inactiveRole = await prisma.role.create({
      data: {
        name: 'Inactive Test Role',
        code: 'INACTIVE_ROLE',
        type: 'CUSTOM',
        isActive: false,
      },
    });
    inactiveRoleId = inactiveRole.id;

    // 6. Create test Permissions
    const perm1 = await prisma.permission.create({
      data: {
        name: 'Read User Test',
        code: 'USER_READ_TEST',
        module: Module.IDENTITY,
        resource: Resource.USER,
        action: Action.READ,
        isActive: true,
      },
    });
    permissionId1 = perm1.id;

    const perm2 = await prisma.permission.create({
      data: {
        name: 'Write User Test',
        code: 'USER_CREATE_TEST',
        module: Module.IDENTITY,
        resource: Resource.USER,
        action: Action.CREATE,
        isActive: true,
      },
    });
    permissionId2 = perm2.id;

    const inactivePerm = await prisma.permission.create({
      data: {
        name: 'Inactive Permission Test',
        code: 'INACTIVE_PERM_TEST',
        module: Module.SYSTEM,
        resource: Resource.PERMISSION,
        action: Action.UPDATE,
        isActive: false,
      },
    });
    inactivePermissionId = inactivePerm.id;
  });

  beforeEach(async () => {
    // Reset mapping table
    await prisma.rolePermission.deleteMany();
  });

  afterAll(async () => {
    // Final clean up and close database connection
    await prisma.rolePermission.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.role.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /roles/:roleId/permissions', () => {
    it('should list permissions assigned to a role', async () => {
      // Setup: insert a mapping
      await prisma.rolePermission.create({
        data: {
          roleId: activeRoleId,
          permissionId: permissionId1,
          isGranted: true,
        },
      });

      const res = await request(app)
        .get(`/api/v1/roles/${activeRoleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].permissionId).toBe(permissionId1);
    });

    it('should return 404 for missing role', async () => {
      const res = await request(app)
        .get(`/api/v1/roles/00000000-0000-0000-0000-000000000000/permissions`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return 400 for invalid role UUID', async () => {
      const res = await request(app)
        .get('/api/v1/roles/invalid-uuid/permissions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('POST /roles/:roleId/permissions', () => {
    it('should assign a permission to a role successfully', async () => {
      const res = await request(app)
        .post(`/api/v1/roles/${activeRoleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          permissionIds: [permissionId1],
          isGranted: true,
        });

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].roleId).toBe(activeRoleId);
      expect(res.body.data[0].permissionId).toBe(permissionId1);

      // Verify DB State
      const mapping = await prisma.rolePermission.findFirst({
        where: { roleId: activeRoleId, permissionId: permissionId1 },
      });
      expect(mapping).toBeDefined();
      expect(mapping?.deletedAt).toBeNull();
    });

    it('should be idempotent if assignment already exists and is active', async () => {
      // First assignment
      await request(app)
        .post(`/api/v1/roles/${activeRoleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ permissionIds: [permissionId1] });

      // Second assignment (idempotent check)
      const res = await request(app)
        .post(`/api/v1/roles/${activeRoleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ permissionIds: [permissionId1] });

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(res.body.data).toHaveLength(1);
    });

    it('should restore a previously soft-deleted mapping', async () => {
      // 1. Create mapping
      const mapping = await prisma.rolePermission.create({
        data: {
          roleId: activeRoleId,
          permissionId: permissionId1,
          isGranted: true,
          deletedAt: new Date(),
        },
      });

      // 2. Perform assignment (restoring soft-deleted one)
      const res = await request(app)
        .post(`/api/v1/roles/${activeRoleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ permissionIds: [permissionId1] });

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(res.body.data[0].id).toBe(mapping.id);

      // Verify DB State (restored)
      const dbMapping = await prisma.rolePermission.findUnique({
        where: { id: mapping.id },
      });
      expect(dbMapping?.deletedAt).toBeNull();
    });

    it('should return 400 for inactive role', async () => {
      const res = await request(app)
        .post(`/api/v1/roles/${inactiveRoleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ permissionIds: [permissionId1] });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 for inactive permission', async () => {
      const res = await request(app)
        .post(`/api/v1/roles/${activeRoleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ permissionIds: [inactivePermissionId] });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 403 for protected system role modifications', async () => {
      const res = await request(app)
        .post(`/api/v1/roles/${protectedRoleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ permissionIds: [permissionId1] });

      expect(res.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should return 400 for duplicate permission IDs in query', async () => {
      const res = await request(app)
        .post(`/api/v1/roles/${activeRoleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ permissionIds: [permissionId1, permissionId1] });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 for empty body or missing fields', async () => {
      const res = await request(app)
        .post(`/api/v1/roles/${activeRoleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 for unknown fields in request body', async () => {
      const res = await request(app)
        .post(`/api/v1/roles/${activeRoleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          permissionIds: [permissionId1],
          unknownField: 'invalid',
        });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('PUT /roles/:roleId/permissions', () => {
    it('should synchronize mappings correctly (replace strategy)', async () => {
      // 1. Setup existing mapping for permission 1
      await prisma.rolePermission.create({
        data: {
          roleId: activeRoleId,
          permissionId: permissionId1,
          isGranted: true,
        },
      });

      // 2. Synchronize to permission 2 (meaning permission 1 gets soft-deleted)
      const res = await request(app)
        .put(`/api/v1/roles/${activeRoleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ permissionIds: [permissionId2] });

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].permissionId).toBe(permissionId2);

      // Verify permission 1 is soft-deleted
      const mapping1 = await prisma.rolePermission.findFirst({
        where: { roleId: activeRoleId, permissionId: permissionId1 },
      });
      expect(mapping1?.deletedAt).not.toBeNull();

      // Verify permission 2 is active
      const mapping2 = await prisma.rolePermission.findFirst({
        where: { roleId: activeRoleId, permissionId: permissionId2 },
      });
      expect(mapping2?.deletedAt).toBeNull();
    });

    it('should support full revocation if empty array is provided', async () => {
      await prisma.rolePermission.create({
        data: {
          roleId: activeRoleId,
          permissionId: permissionId1,
          isGranted: true,
        },
      });

      const res = await request(app)
        .put(`/api/v1/roles/${activeRoleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ permissionIds: [] });

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data).toHaveLength(0);

      // Verify soft-deleted
      const mapping1 = await prisma.rolePermission.findFirst({
        where: { roleId: activeRoleId, permissionId: permissionId1 },
      });
      expect(mapping1?.deletedAt).not.toBeNull();
    });
  });

  describe('DELETE /roles/:roleId/permissions/:permissionId', () => {
    it('should soft-delete permission mapping successfully', async () => {
      // Setup mapping
      await prisma.rolePermission.create({
        data: {
          roleId: activeRoleId,
          permissionId: permissionId1,
          isGranted: true,
        },
      });

      const res = await request(app)
        .delete(`/api/v1/roles/${activeRoleId}/permissions/${permissionId1}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.NO_CONTENT);

      // Verify DB soft deleted
      const mapping = await prisma.rolePermission.findFirst({
        where: { roleId: activeRoleId, permissionId: permissionId1 },
      });
      expect(mapping?.deletedAt).not.toBeNull();
    });

    it('should return 404 for missing mapping', async () => {
      const res = await request(app)
        .delete(`/api/v1/roles/${activeRoleId}/permissions/${permissionId2}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('Authorization and Authentication Guard Tests', () => {
    it('should return 401 for requests without token', async () => {
      const res = await request(app).get(`/api/v1/roles/${activeRoleId}/permissions`);
      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should return 403 for normal users (insufficient privileges)', async () => {
      const res = await request(app)
        .get(`/api/v1/roles/${activeRoleId}/permissions`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(HttpStatus.FORBIDDEN);
    });
  });
});
