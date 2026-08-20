import request from 'supertest';
import express, { Request, Response } from 'express';
import { prisma } from '../../config/db';
import { generateAccessToken } from '../../shared/utils/jwt';
import { AuthMiddleware } from '../auth.middleware';
import { AuthRepository } from '../../modules/auth/repositories/auth.repository';
import { authorizePermission, authorizeRole } from '../authorization.middleware';
import { HttpStatus } from '../../constants/httpStatus';
import { Module, Resource, Action } from '@prisma/client';

describe('Dynamic Granular Permission Enforcement Integration Tests', () => {
  let testApp: express.Application;

  let superAdminToken: string;
  let adminToken: string;
  let employeeToken: string;
  let clientToken: string;
  let inactiveUserToken: string;

  let superAdminUserId: string;
  let adminUserId: string;
  let employeeUserId: string;
  let clientUserId: string;
  let inactiveUserId: string;

  let adminRoleId: string;
  let employeeRoleId: string;
  let userReadPermId: string;

  beforeAll(async () => {
    // 1. Roles
    let superAdminRole = await prisma.role.findUnique({ where: { code: 'SUPER_ADMIN' } });
    if (!superAdminRole) {
      superAdminRole = await prisma.role.create({
        data: { name: 'Super Admin', code: 'SUPER_ADMIN', type: 'SYSTEM', isSystem: true, priority: 100 },
      });
    }

    let adminRole = await prisma.role.findUnique({ where: { code: 'ADMIN' } });
    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: { name: 'Admin', code: 'ADMIN', type: 'SYSTEM', isSystem: true, priority: 90 },
      });
    }
    adminRoleId = adminRole.id;

    let employeeRole = await prisma.role.findUnique({ where: { code: 'EMPLOYEE' } });
    if (!employeeRole) {
      employeeRole = await prisma.role.create({
        data: { name: 'Employee', code: 'EMPLOYEE', type: 'SYSTEM', isSystem: true, priority: 10 },
      });
    }
    employeeRoleId = employeeRole.id;

    let clientRole = await prisma.role.findUnique({ where: { code: 'CLIENT' } });
    if (!clientRole) {
      clientRole = await prisma.role.create({
        data: { name: 'Client', code: 'CLIENT', type: 'SYSTEM', isSystem: true, priority: 5 },
      });
    }

    // 2. Permissions
    const userReadPerm = await prisma.permission.upsert({
      where: { code: 'USER_READ' },
      update: { isActive: true },
      create: {
        name: 'Read User',
        code: 'USER_READ',
        module: Module.IDENTITY,
        resource: Resource.USER,
        action: Action.READ,
        isActive: true,
      },
    });
    userReadPermId = userReadPerm.id;

    await prisma.permission.upsert({
      where: { code: 'USER_CREATE' },
      update: { isActive: true },
      create: {
        name: 'Create User',
        code: 'USER_CREATE',
        module: Module.IDENTITY,
        resource: Resource.USER,
        action: Action.CREATE,
        isActive: true,
      },
    });

    // Grant USER_READ to Admin role in DB
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRoleId,
          permissionId: userReadPermId,
        },
      },
      update: { isGranted: true, deletedAt: null },
      create: {
        roleId: adminRoleId,
        permissionId: userReadPermId,
        isGranted: true,
      },
    });

    // 3. Test Users
    const superAdmin = await prisma.user.create({
      data: {
        email: 'auth_superadmin@example.com',
        firstName: 'Super',
        lastName: 'Admin',
        displayName: 'Super Admin User',
        status: 'ACTIVE',
      },
    });
    superAdminUserId = superAdmin.id;
    await prisma.userRole.create({ data: { userId: superAdminUserId, roleId: superAdminRole.id } });

    const admin = await prisma.user.create({
      data: {
        email: 'auth_admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        displayName: 'Admin User',
        status: 'ACTIVE',
      },
    });
    adminUserId = admin.id;
    await prisma.userRole.create({ data: { userId: adminUserId, roleId: adminRoleId } });

    const employee = await prisma.user.create({
      data: {
        email: 'auth_employee@example.com',
        firstName: 'Emp',
        lastName: 'User',
        displayName: 'Emp User',
        status: 'ACTIVE',
      },
    });
    employeeUserId = employee.id;
    await prisma.userRole.create({ data: { userId: employeeUserId, roleId: employeeRoleId } });

    const clientUser = await prisma.user.create({
      data: {
        email: 'auth_client@example.com',
        firstName: 'Client',
        lastName: 'User',
        displayName: 'Client User',
        status: 'ACTIVE',
      },
    });
    clientUserId = clientUser.id;
    await prisma.userRole.create({ data: { userId: clientUserId, roleId: clientRole.id } });

    const inactiveUser = await prisma.user.create({
      data: {
        email: 'auth_inactive@example.com',
        firstName: 'Inactive',
        lastName: 'User',
        displayName: 'Inactive User',
        status: 'INACTIVE',
      },
    });
    inactiveUserId = inactiveUser.id;
    await prisma.userRole.create({ data: { userId: inactiveUserId, roleId: adminRoleId } });

    // 4. Tokens
    superAdminToken = generateAccessToken({ sub: superAdminUserId, email: superAdmin.email });
    adminToken = generateAccessToken({ sub: adminUserId, email: admin.email });
    employeeToken = generateAccessToken({ sub: employeeUserId, email: employee.email });
    clientToken = generateAccessToken({ sub: clientUserId, email: clientUser.email });
    inactiveUserToken = generateAccessToken({ sub: inactiveUserId, email: inactiveUser.email });

    // 5. Build test Express application with custom routes
    const authRepository = new AuthRepository();
    const authMiddleware = new AuthMiddleware(authRepository);

    testApp = express();
    testApp.use(express.json());

    // Protected Route requiring USER_READ permission
    testApp.get(
      '/test/user-read',
      authMiddleware.handle,
      authorizePermission('USER_READ'),
      (_req: Request, res: Response) => {
        res.status(HttpStatus.OK).json({ success: true, message: 'USER_READ granted' });
      }
    );

    // Protected Route requiring USER_CREATE permission
    testApp.post(
      '/test/user-create',
      authMiddleware.handle,
      authorizePermission('USER_CREATE'),
      (_req: Request, res: Response) => {
        res.status(HttpStatus.OK).json({ success: true, message: 'USER_CREATE granted' });
      }
    );

    // Protected Route requiring non-existent unknown permission
    testApp.get(
      '/test/unknown-permission',
      authMiddleware.handle,
      authorizePermission('NON_EXISTENT_PERM_XYZ'),
      (_req: Request, res: Response) => {
        res.status(HttpStatus.OK).json({ success: true, message: 'Allowed' });
      }
    );

    // Protected Route with role guard (Admin role)
    testApp.get(
      '/test/admin-role-only',
      authMiddleware.handle,
      authorizeRole(['Super Admin', 'Admin']),
      (_req: Request, res: Response) => {
        res.status(HttpStatus.OK).json({ success: true, message: 'Role authorized' });
      }
    );

    // Error handling middleware
    testApp.use((err: any, _req: Request, res: Response, _next: any) => {
      const status = err.statusCode || err.status || 500;
      res.status(status).json({ success: false, message: err.message });
    });
  });

  afterAll(async () => {
    await prisma.userRole.deleteMany({
      where: { userId: { in: [superAdminUserId, adminUserId, employeeUserId, clientUserId, inactiveUserId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [superAdminUserId, adminUserId, employeeUserId, clientUserId, inactiveUserId] } },
    });
  });

  describe('1. Dynamic Permission Evaluation & Database Verification', () => {
    it('should ALLOW Admin user with granted USER_READ permission in database', async () => {
      const res = await request(testApp)
        .get('/test/user-read')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.success).toBe(true);
    });

    it('should DENY Admin user when requested permission (USER_CREATE) is NOT granted in database with 403', async () => {
      const res = await request(testApp)
        .post('/test/user-create')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.FORBIDDEN);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Insufficient permissions');
    });

    it('should IMMEDIATELY block access (403) when permission is revoked in database without modifying request', async () => {
      // 1. Temporarily revoke USER_READ in DB
      await prisma.rolePermission.update({
        where: { roleId_permissionId: { roleId: adminRoleId, permissionId: userReadPermId } },
        data: { isGranted: false },
      });

      // 2. Request should be denied
      const res1 = await request(testApp)
        .get('/test/user-read')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res1.status).toBe(HttpStatus.FORBIDDEN);

      // 3. Re-grant permission in DB
      await prisma.rolePermission.update({
        where: { roleId_permissionId: { roleId: adminRoleId, permissionId: userReadPermId } },
        data: { isGranted: true },
      });

      // 4. Request should now succeed
      const res2 = await request(testApp)
        .get('/test/user-read')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res2.status).toBe(HttpStatus.OK);
    });
  });

  describe('2. SUPER_ADMIN Unrestricted Access', () => {
    it('should ALLOW Super Admin unrestricted access to USER_READ route', async () => {
      const res = await request(testApp)
        .get('/test/user-read')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(HttpStatus.OK);
    });

    it('should ALLOW Super Admin unrestricted access to route requiring un-granted USER_CREATE', async () => {
      const res = await request(testApp)
        .post('/test/user-create')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(HttpStatus.OK);
    });

    it('should ALLOW Super Admin unrestricted access even to non-existent permission route', async () => {
      const res = await request(testApp)
        .get('/test/unknown-permission')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(HttpStatus.OK);
    });
  });

  describe('3. Role Hierarchy & Guard Restrictions', () => {
    it('should DENY Employee user attempting to access admin permission route with 403', async () => {
      const res = await request(testApp)
        .get('/test/user-read')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should DENY Client user attempting to access admin permission route with 403', async () => {
      const res = await request(testApp)
        .get('/test/user-read')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should DENY Employee user attempting to access role-guarded route with 403', async () => {
      const res = await request(testApp)
        .get('/test/admin-role-only')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(HttpStatus.FORBIDDEN);
    });
  });

  describe('4. Security & Safety Edge Cases', () => {
    it('should DENY access to unknown/non-existent permission with 403 for standard Admin', async () => {
      const res = await request(testApp)
        .get('/test/unknown-permission')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('should return 401 Unauthorized for request without Authorization header', async () => {
      const res = await request(testApp).get('/test/user-read');
      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should return 401 Unauthorized for inactive user account', async () => {
      const res = await request(testApp)
        .get('/test/user-read')
        .set('Authorization', `Bearer ${inactiveUserToken}`);

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toContain('User account is inactive');
    });
  });
});
