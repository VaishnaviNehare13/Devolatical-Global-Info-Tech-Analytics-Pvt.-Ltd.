import {
  RoleDetails,
  FindRolesOptions,
  PaginatedRoles,
  CreateRoleData,
  UpdateRoleData,
} from '../types/role.types';

/**
 * Interface contract for the Roles Repository.
 * Relies on pure domain interfaces and exports business-agnostic data operations.
 */
export interface IRoleRepository {
  /**
   * Retrieves a paginated list of role summary entities based on filters and options.
   */
  findRoles(options: FindRolesOptions): Promise<PaginatedRoles>;

  /**
   * Retrieves summary details of an active or inactive role by ID. Returns null if not found.
   */
  findRoleById(id: string): Promise<RoleDetails | null>;

  /**
   * Retrieves summary details of an active or inactive role by unique role code. Returns null if not found.
   */
  findRoleByCode(code: string): Promise<RoleDetails | null>;

  /**
   * Retrieves summary details of an active or inactive role by name. Returns null if not found.
   */
  findRoleByName(name: string): Promise<RoleDetails | null>;

  /**
   * Inserts a new role into database persistence.
   */
  createRole(data: CreateRoleData): Promise<RoleDetails>;

  /**
   * Modifies columns on a role.
   */
  updateRole(id: string, data: UpdateRoleData): Promise<RoleDetails>;

  /**
   * Toggles the active status flag of a role.
   */
  updateRoleStatus(id: string, isActive: boolean): Promise<RoleDetails>;

  /**
   * Marks a role as soft-deleted in persistence.
   */
  softDeleteRole(id: string): Promise<boolean>;

  /**
   * Counts the number of active user role assignments associated with a role.
   */
  countUsersUsingRole(roleId: string): Promise<number>;

  /**
   * Checks if any role exists in database persistence matching the given unique role code.
   */
  existsByCode(code: string): Promise<boolean>;

  /**
   * Checks if any role exists in database persistence matching the given name.
   */
  existsByName(name: string): Promise<boolean>;
}
