import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError } from '../utils/appError';
import { HttpStatus } from '../constants/httpStatus';
import { prisma } from '../config/db';
import { SYSTEM_ROLES } from '../shared/constants/roles';

/**
 * Extensible configuration options for Authorization Middleware.
 */
export interface AuthorizationOptions {
  readonly roles?: readonly string[];
  readonly permissions?: readonly string[];
}

/**
 * Custom Authorization Error thrown on permission or role check failures.
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Forbidden: Insufficient role or privileges') {
    super(message, HttpStatus.FORBIDDEN);
    this.name = 'AuthorizationError';
  }
}

/**
 * Generic authorization middleware checking user roles and/or database-backed permissions.
 * Relies on Request.user attached by Authentication middleware.
 *
 * @param options Required roles and/or permissions to access the resource
 */
export function authorize(options: AuthorizationOptions): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError('Unauthorized: Authentication required', HttpStatus.UNAUTHORIZED);
      }

      if (user.status && user.status !== 'ACTIVE') {
        throw new AppError('Unauthorized: User account is inactive', HttpStatus.UNAUTHORIZED);
      }

      const userRoles = user.roles || [];

      // 1. SUPER_ADMIN Unrestricted Access Check
      // If user has SUPER_ADMIN role (by code or name), grant unrestricted access immediately
      const isSuperAdmin = userRoles.some(
        (role) =>
          role === 'SUPER_ADMIN' ||
          role === 'Super Admin' ||
          role === SYSTEM_ROLES.SUPER_ADMIN
      );

      if (isSuperAdmin) {
        return next();
      }

      // 2. Validate required roles if configured
      let hasRequiredRole = true;
      if (options.roles && options.roles.length > 0) {
        hasRequiredRole = userRoles.some((role) => options.roles!.includes(role));
      }

      // 3. Validate required permissions via database RolePermission evaluation
      let hasRequiredPermissions = true;
      if (options.permissions && options.permissions.length > 0) {
        const requiredPermissions = Array.from(options.permissions);

        // Fetch active, non-deleted granted permissions for user's assigned active roles
        const grantedRolePermissions = await prisma.rolePermission.findMany({
          where: {
            isGranted: true,
            deletedAt: null,
            role: {
              isActive: true,
              userRoles: {
                some: {
                  userId: user.id,
                },
              },
            },
            permission: {
              isActive: true,
              OR: [
                { code: { in: requiredPermissions } },
                { name: { in: requiredPermissions } },
              ],
            },
          },
          select: {
            permission: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        });

        const grantedSet = new Set<string>();
        for (const rp of grantedRolePermissions) {
          if (rp.permission?.code) grantedSet.add(rp.permission.code);
          if (rp.permission?.name) grantedSet.add(rp.permission.name);
        }

        // User must possess every required permission
        hasRequiredPermissions = requiredPermissions.every((perm) => grantedSet.has(perm));
      }

      if (options.roles && options.roles.length > 0 && !hasRequiredRole) {
        throw new AuthorizationError('Forbidden: Insufficient role');
      }

      if (options.permissions && options.permissions.length > 0 && !hasRequiredPermissions) {
        throw new AuthorizationError('Forbidden: Insufficient permissions');
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

/**
 * Convenient helper for single or multiple permission authorization guards
 */
export function authorizePermission(permissions: string | readonly string[]): RequestHandler {
  const permList = typeof permissions === 'string' ? [permissions] : permissions;
  return authorize({ permissions: permList });
}

/**
 * Convenient helper for single or multiple role authorization guards
 */
export function authorizeRole(roles: string | readonly string[]): RequestHandler {
  const roleList = typeof roles === 'string' ? [roles] : roles;
  return authorize({ roles: roleList });
}

