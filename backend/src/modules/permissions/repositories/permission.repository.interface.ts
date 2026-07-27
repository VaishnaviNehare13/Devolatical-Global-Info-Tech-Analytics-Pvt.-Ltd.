import {
  PermissionDetails,
  FindPermissionsOptions,
  PaginatedPermissions,
  CreatePermissionData,
  UpdatePermissionData,
} from '../types/permission.types';

/**
 * Interface contract for the Permissions Repository.
 * Relies on pure domain interfaces and exports business-agnostic data operations.
 */
export interface IPermissionRepository {
  /**
   * Retrieves a paginated list of permission summary entities based on filters and options.
   */
  findPermissions(options: FindPermissionsOptions): Promise<PaginatedPermissions>;

  /**
   * Retrieves summary details of an active or inactive permission by ID. Returns null if not found.
   */
  findPermissionById(id: string): Promise<PermissionDetails | null>;

  /**
   * Retrieves summary details of an active or inactive permission by unique permission code. Returns null if not found.
   */
  findPermissionByCode(code: string): Promise<PermissionDetails | null>;

  /**
   * Retrieves summary details of an active or inactive permission by name. Returns null if not found.
   */
  findPermissionByName(name: string): Promise<PermissionDetails | null>;

  /**
   * Checks if any permission exists in database persistence matching the given unique permission code.
   */
  existsByCode(code: string): Promise<boolean>;

  /**
   * Checks if any permission exists in database persistence matching the given name.
   */
  existsByName(name: string): Promise<boolean>;

  /**
   * Inserts a new permission into database persistence.
   */
  createPermission(data: CreatePermissionData): Promise<PermissionDetails>;

  /**
   * Modifies columns on a permission.
   */
  updatePermission(id: string, data: UpdatePermissionData): Promise<PermissionDetails>;

  /**
   * Marks a permission as soft-deleted in persistence.
   */
  softDeletePermission(id: string): Promise<boolean>;

  /**
   * Counts the number of active role permission mappings associated with a permission.
   */
  countRolesUsingPermission(permissionId: string): Promise<number>;
}
