import {
  Prisma,
  Module as PrismaModule,
  Resource as PrismaResource,
  Action as PrismaAction,
} from '@prisma/client';
import {
  PermissionSummary,
  PermissionDetails,
  RoleSummaryPayload,
  PermissionModule as DomainModule,
  PermissionResource as DomainResource,
  PermissionAction as DomainAction,
} from '../types/permission.types';
import {
  PERMISSION_SUMMARY_SELECT,
  PERMISSION_DETAILS_SELECT,
} from '../repositories/permission.repository.select';

type DbPermissionSummary = Prisma.PermissionGetPayload<{
  select: typeof PERMISSION_SUMMARY_SELECT;
}>;
type DbPermissionDetails = Prisma.PermissionGetPayload<{
  select: typeof PERMISSION_DETAILS_SELECT;
}>;

/**
 * Pure Mapper responsible for translating database records to domain models.
 * Contains no business rules, formatting logic, or calculations.
 */
export class PermissionMapper {
  /**
   * Translates Prisma client enums into domain string union types.
   * Compiles exhaustively to ensure that any new enum properties added to the Prisma schema
   * trigger compilation checks here.
   */
  public static mapModule(prismaModule: PrismaModule): DomainModule {
    switch (prismaModule) {
      case PrismaModule.IDENTITY:
        return 'IDENTITY';
      case PrismaModule.CRM:
        return 'CRM';
      case PrismaModule.PROJECT:
        return 'PROJECT';
      case PrismaModule.SUPPORT:
        return 'SUPPORT';
      case PrismaModule.FINANCE:
        return 'FINANCE';
      case PrismaModule.CAREER:
        return 'CAREER';
      case PrismaModule.CMS:
        return 'CMS';
      case PrismaModule.ANALYTICS:
        return 'ANALYTICS';
      case PrismaModule.NOTIFICATION:
        return 'NOTIFICATION';
      case PrismaModule.SYSTEM:
        return 'SYSTEM';
      default: {
        const exhaustiveCheck: never = prismaModule;
        throw new Error(`Unhandled database Module encountered: ${exhaustiveCheck}`);
      }
    }
  }

  /**
   * Translates Prisma client enums into domain string union types.
   */
  public static mapResource(prismaResource: PrismaResource): DomainResource {
    switch (prismaResource) {
      case PrismaResource.USER:
        return 'USER';
      case PrismaResource.ROLE:
        return 'ROLE';
      case PrismaResource.PERMISSION:
        return 'PERMISSION';
      case PrismaResource.PROJECT:
        return 'PROJECT';
      case PrismaResource.TASK:
        return 'TASK';
      case PrismaResource.CLIENT:
        return 'CLIENT';
      case PrismaResource.EMPLOYEE:
        return 'EMPLOYEE';
      case PrismaResource.JOB:
        return 'JOB';
      case PrismaResource.APPLICATION:
        return 'APPLICATION';
      case PrismaResource.REPORT:
        return 'REPORT';
      case PrismaResource.INVOICE:
        return 'INVOICE';
      case PrismaResource.PAYMENT:
        return 'PAYMENT';
      case PrismaResource.DASHBOARD:
        return 'DASHBOARD';
      default: {
        const exhaustiveCheck: never = prismaResource;
        throw new Error(`Unhandled database Resource encountered: ${exhaustiveCheck}`);
      }
    }
  }

  /**
   * Translates Prisma client enums into domain string union types.
   */
  public static mapAction(prismaAction: PrismaAction): DomainAction {
    switch (prismaAction) {
      case PrismaAction.CREATE:
        return 'CREATE';
      case PrismaAction.READ:
        return 'READ';
      case PrismaAction.UPDATE:
        return 'UPDATE';
      case PrismaAction.DELETE:
        return 'DELETE';
      case PrismaAction.APPROVE:
        return 'APPROVE';
      case PrismaAction.ASSIGN:
        return 'ASSIGN';
      case PrismaAction.EXPORT:
        return 'EXPORT';
      case PrismaAction.IMPORT:
        return 'IMPORT';
      case PrismaAction.DOWNLOAD:
        return 'DOWNLOAD';
      case PrismaAction.PUBLISH:
        return 'PUBLISH';
      default: {
        const exhaustiveCheck: never = prismaAction;
        throw new Error(`Unhandled database Action encountered: ${exhaustiveCheck}`);
      }
    }
  }

  /**
   * Maps a database record to a Domain PermissionSummary entity.
   */
  public static toDomainSummary(dbRecord: DbPermissionSummary): PermissionSummary {
    return {
      id: dbRecord.id,
      name: dbRecord.name,
      code: dbRecord.code,
      description: dbRecord.description,
      module: this.mapModule(dbRecord.module),
      resource: this.mapResource(dbRecord.resource),
      action: this.mapAction(dbRecord.action),
      isActive: dbRecord.isActive,
      isSystem: dbRecord.isSystem,
      displayOrder: dbRecord.displayOrder,
      createdAt: dbRecord.createdAt,
      updatedAt: dbRecord.updatedAt,
    };
  }

  /**
   * Maps a database record to a Domain PermissionDetails entity.
   */
  public static toDomainDetails(dbRecord: DbPermissionDetails): PermissionDetails {
    const roles: RoleSummaryPayload[] = (dbRecord.rolePermissions || []).map((rp) => ({
      id: rp.role.id,
      name: rp.role.name,
      code: rp.role.code,
    }));

    return {
      ...this.toDomainSummary(dbRecord),
      roles,
    };
  }
}
