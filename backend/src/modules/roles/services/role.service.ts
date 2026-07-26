import { IRoleRepository } from '../repositories/role.repository.interface';
import {
  RoleDetails,
  FindRolesOptions,
  PaginatedRoles,
  CreateRoleData,
  UpdateRoleData,
  RoleSummary,
} from '../types/role.types';
import {
  RoleServiceError,
  RoleNotFoundError,
  DuplicateRoleNameError,
  DuplicateRoleCodeError,
  ProtectedRoleError,
  InvalidRoleStatusError,
  RoleInUseError,
} from '../types/role.service.errors';

/**
 * Concrete service layer class responsible for orchestrating Roles business logic.
 * Encapsulates all policy controls, state transition assertions, and validation rules.
 * Completely independent of Express, HTTP context, and ORMs.
 */
export class RoleService {
  constructor(private readonly roleRepository: IRoleRepository) {}

  /**
   * Queries paginated, filtered, and sorted list of roles.
   */
  public async getRoles(options: FindRolesOptions): Promise<PaginatedRoles> {
    try {
      return await this.roleRepository.findRoles(options);
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  /**
   * Retrieves summary details of a role by ID.
   *
   * @throws {RoleNotFoundError} If role is deleted or missing
   */
  public async getRoleById(id: string): Promise<RoleDetails> {
    try {
      return await this.ensureRoleExists(id);
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  /**
   * Handles creating a new Custom role.
   *
   * @throws {DuplicateRoleNameError} If name conflicts with an existing role
   * @throws {DuplicateRoleCodeError} If code conflicts with an existing role
   */
  public async createRole(data: CreateRoleData): Promise<RoleDetails> {
    try {
      await this.ensureRoleNameAvailable(data.name);
      await this.ensureRoleCodeAvailable(data.code);

      return await this.roleRepository.createRole(data);
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  /**
   * Handles updating fields of an existing role.
   *
   * @throws {RoleNotFoundError} If role is deleted or missing
   * @throws {ProtectedRoleError} If trying to rename a protected system role
   * @throws {DuplicateRoleNameError} If new name conflicts with another role
   */
  public async updateRole(id: string, data: UpdateRoleData): Promise<RoleDetails> {
    try {
      const role = await this.ensureRoleExists(id);

      // System roles cannot be renamed
      if (data.name !== undefined && data.name !== role.name) {
        this.ensureRoleCanUpdate(role);
        await this.ensureRoleNameAvailable(data.name, id);
      }

      return await this.roleRepository.updateRole(id, data);
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  /**
   * Updates active state toggles for roles.
   *
   * @throws {RoleNotFoundError} If role is deleted or missing
   * @throws {InvalidRoleStatusError} If trying to trigger a redundant transition
   * @throws {ProtectedRoleError} If deactivating system-critical roles
   */
  public async updateRoleStatus(id: string, isActive: boolean): Promise<RoleDetails> {
    try {
      const role = await this.ensureRoleExists(id);
      this.ensureValidStatusTransition(role.isActive, isActive);

      if (!isActive) {
        this.ensureRoleCanDeactivate(role, isActive);
      }

      return await this.roleRepository.updateRoleStatus(id, isActive);
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  /**
   * Handles soft deleting roles.
   *
   * @throws {RoleNotFoundError} If role is deleted or missing
   * @throws {ProtectedRoleError} If trying to delete system roles
   * @throws {RoleInUseError} If users are currently assigned to this role
   */
  public async deleteRole(id: string): Promise<void> {
    try {
      const role = await this.ensureRoleExists(id);
      this.ensureRoleCanDelete(role);
      await this.ensureRoleNotUsed(id);

      await this.roleRepository.softDeleteRole(id);
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  // ==========================================
  // Private Business-Oriented Guards
  // ==========================================

  /**
   * Asserts that a role exists and is active.
   */
  private async ensureRoleExists(id: string): Promise<RoleDetails> {
    const role = await this.roleRepository.findRoleById(id);
    if (!role) {
      throw new RoleNotFoundError(`Role with ID "${id}" was not found.`);
    }
    return role;
  }

  /**
   * Asserts that a role name is unique, ignoring a specified ID if updating.
   */
  private async ensureRoleNameAvailable(name: string, excludeId?: string): Promise<void> {
    const existingRole = await this.roleRepository.findRoleByName(name);
    if (existingRole && (!excludeId || existingRole.id !== excludeId)) {
      throw new DuplicateRoleNameError(`Role name "${name}" is already in use.`);
    }
  }

  /**
   * Asserts that a role code is unique, ignoring a specified ID if updating.
   */
  private async ensureRoleCodeAvailable(code: string, excludeId?: string): Promise<void> {
    const existingRole = await this.roleRepository.findRoleByCode(code);
    if (existingRole && (!excludeId || existingRole.id !== excludeId)) {
      throw new DuplicateRoleCodeError(`Role code "${code}" is already in use.`);
    }
  }

  /**
   * Asserts that a role is eligible for updates (blocks system role renames).
   */
  private ensureRoleCanUpdate(role: RoleSummary): void {
    if (role.isSystem) {
      throw new ProtectedRoleError(
        `Role "${role.code}" is a protected system account and cannot be modified.`
      );
    }
  }

  /**
   * Asserts that a role is eligible for deletion (blocks system role deletes).
   */
  private ensureRoleCanDelete(role: RoleSummary): void {
    if (role.isSystem) {
      throw new ProtectedRoleError(
        `Role "${role.code}" is a protected system account and cannot be deleted.`
      );
    }
  }

  /**
   * Asserts that a role is eligible for deactivation (blocks system role deactivation).
   */
  private ensureRoleCanDeactivate(role: RoleSummary, newStatus: boolean): void {
    if (role.isSystem && !newStatus) {
      throw new ProtectedRoleError(
        `Role "${role.code}" is a critical system role and cannot be deactivated.`
      );
    }
  }

  /**
   * Asserts that no active users are currently assigned to a role.
   */
  private async ensureRoleNotUsed(roleId: string): Promise<void> {
    const activeAssignments = await this.roleRepository.countUsersUsingRole(roleId);
    if (activeAssignments > 0) {
      throw new RoleInUseError(
        `Role cannot be deleted. There are ${activeAssignments} active user assignments associated with it.`
      );
    }
  }

  /**
   * Asserts that a status change represents a valid transition.
   */
  private ensureValidStatusTransition(currentStatus: boolean, newStatus: boolean): void {
    if (currentStatus === newStatus) {
      throw new InvalidRoleStatusError(
        `Role status transition failed. Status is already ${currentStatus ? 'active' : 'inactive'}.`
      );
    }
  }

  /**
   * Maps underlying repository exception instances to Service-level equivalents.
   */
  private handleRepositoryError(error: unknown): never {
    if (error instanceof RoleServiceError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'RepositoryError') {
      throw new RoleServiceError(error.message);
    }
    throw error as never;
  }
}
