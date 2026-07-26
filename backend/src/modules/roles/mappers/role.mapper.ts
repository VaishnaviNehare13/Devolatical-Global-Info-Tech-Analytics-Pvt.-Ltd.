import { Prisma, RoleType as PrismaRoleType } from '@prisma/client';
import {
  RoleSummary,
  RoleDetails,
  PermissionSummary,
  RoleType as DomainRoleType,
} from '../types/role.types';
import { ROLE_SUMMARY_SELECT, ROLE_DETAILS_SELECT } from '../repositories/role.repository.select';

type DbRoleSummary = Prisma.RoleGetPayload<{ select: typeof ROLE_SUMMARY_SELECT }>;
type DbRoleDetails = Prisma.RoleGetPayload<{ select: typeof ROLE_DETAILS_SELECT }>;

/**
 * Pure Mapper responsible for translating database records to domain models.
 * Contains no business rules, formatting logic, or calculations.
 */
export class RoleMapper {
  /**
   * Translates Prisma client enums into domain string union types.
   * Compiles exhaustively to ensure that any new enum properties added to the Prisma schema
   * trigger compilation checks here.
   */
  public static mapRoleType(prismaType: PrismaRoleType): DomainRoleType {
    switch (prismaType) {
      case PrismaRoleType.SYSTEM:
        return 'SYSTEM';
      case PrismaRoleType.CUSTOM:
        return 'CUSTOM';
      default: {
        const exhaustiveCheck: never = prismaType;
        throw new Error(`Unhandled database RoleType encountered: ${exhaustiveCheck}`);
      }
    }
  }

  /**
   * Maps a database record to a Domain RoleSummary entity.
   */
  public static toDomainSummary(dbRecord: DbRoleSummary): RoleSummary {
    return {
      id: dbRecord.id,
      name: dbRecord.name,
      code: dbRecord.code,
      description: dbRecord.description,
      type: this.mapRoleType(dbRecord.type),
      priority: dbRecord.priority,
      isActive: dbRecord.isActive,
      isDefault: dbRecord.isDefault,
      isSystem: dbRecord.isSystem,
      createdAt: dbRecord.createdAt,
      updatedAt: dbRecord.updatedAt,
    };
  }

  /**
   * Maps a database record to a Domain RoleDetails entity.
   */
  public static toDomainDetails(dbRecord: DbRoleDetails): RoleDetails {
    const permissions: PermissionSummary[] = (dbRecord.rolePermissions || []).map((rp) => ({
      id: rp.permission.id,
      name: rp.permission.name,
      code: rp.permission.code,
    }));

    return {
      ...this.toDomainSummary(dbRecord),
      permissions,
    };
  }
}
