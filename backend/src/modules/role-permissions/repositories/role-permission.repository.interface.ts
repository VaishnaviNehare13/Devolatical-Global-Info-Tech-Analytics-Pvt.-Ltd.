import {
  MappingDetails,
  FindMappingsOptions,
  PaginatedMappings,
} from '../types/role-permission.types';

export interface IRolePermissionRepository {
  /**
   * Retrieves a paginated list of role-permission mappings.
   */
  findMappings(options: FindMappingsOptions): Promise<PaginatedMappings>;

  /**
   * Finds a specific mapping by ID.
   */
  findMappingById(id: string): Promise<MappingDetails | null>;

  /**
   * Finds a mapping by unique combination of roleId and permissionId.
   */
  findMappingByRoleAndPermission(
    roleId: string,
    permissionId: string
  ): Promise<MappingDetails | null>;

  /**
   * Creates role-permission mappings in bulk.
   */
  createMappingsBulk(
    roleId: string,
    permissionIds: string[],
    isGranted: boolean
  ): Promise<MappingDetails[]>;

  /**
   * Updates the isGranted status on a specific mapping.
   */
  updateMapping(id: string, isGranted: boolean): Promise<MappingDetails>;

  /**
   * Performs soft deletion of mapping associations.
   */
  deleteMapping(roleId: string, permissionId: string): Promise<boolean>;

  /**
   * Checks if a mapping exists for the given combination of roleId and permissionId.
   */
  existsRolePermission(roleId: string, permissionId: string): Promise<boolean>;

  /**
   * Restores a soft-deleted mapping to active status.
   */
  restoreMapping(id: string, isGranted: boolean): Promise<MappingDetails>;

  /**
   * Counts active mappings currently associated with a role.
   */
  countActiveMappingsForRole(roleId: string): Promise<number>;
}
