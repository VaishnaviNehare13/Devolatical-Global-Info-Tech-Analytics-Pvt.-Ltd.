import { IRolePermissionRepository } from '../repositories/role-permission.repository.interface';
import { IRoleRepository } from '../../roles/repositories/role.repository.interface';
import { IPermissionRepository } from '../../permissions/repositories/permission.repository.interface';
import { MappingDetails } from '../types/role-permission.types';
import { RoleDetails } from '../../roles/types/role.types';
import { PermissionDetails } from '../../permissions/types/permission.types';
import {
  RolePermissionServiceError,
  MappingNotFoundError,
  ProtectedRoleMappingError,
  InvalidMappingStateError,
} from '../types/role-permission.service.errors';

/**
 * Concrete service layer class responsible for orchestrating Role-Permission mapping business logic.
 * Encapsulates all policy controls, state transition assertions, and validation rules.
 * Completely independent of Express, HTTP context, and ORMs.
 */
export class RolePermissionService {
  constructor(
    private readonly rolePermissionRepository: IRolePermissionRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository
  ) {}

  /**
   * Retrieves all permissions mapped to a specific role.
   *
   * @throws {RolePermissionServiceError} If role is missing
   */
  public async getRolePermissions(roleId: string): Promise<readonly MappingDetails[]> {
    try {
      await this.ensureRoleExists(roleId);

      const result = await this.rolePermissionRepository.findMappings({
        filters: { roleId, includeDeleted: false },
      });

      return result.items;
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  /**
   * Assigns a list of permissions to a role.
   *
   * @throws {RolePermissionServiceError} If role or any permission is missing
   * @throws {InvalidMappingStateError} If role or any permission is inactive
   * @throws {ProtectedRoleMappingError} If target role is a system role
   */
  public async assignPermissions(
    roleId: string,
    permissionIds: string[],
    isGranted = true
  ): Promise<readonly MappingDetails[]> {
    try {
      const role = await this.ensureRoleExists(roleId);
      this.ensureRoleIsActive(role);
      this.ensureRoleIsNotProtected(role);
      await this.ensurePermissionsExist(permissionIds);

      return await this.rolePermissionRepository.assignPermissionsBulk(
        roleId,
        permissionIds,
        isGranted
      );
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  /**
   * Synchronizes mappings for a role to match exactly the supplied permission ID list.
   *
   * @throws {RolePermissionServiceError} If role or any permission is missing
   * @throws {InvalidMappingStateError} If role or any permission is inactive
   * @throws {ProtectedRoleMappingError} If target role is a system role
   */
  public async replacePermissions(
    roleId: string,
    permissionIds: string[],
    isGranted = true
  ): Promise<readonly MappingDetails[]> {
    try {
      const role = await this.ensureRoleExists(roleId);
      this.ensureRoleIsActive(role);
      this.ensureRoleIsNotProtected(role);
      await this.ensurePermissionsExist(permissionIds);

      return await this.rolePermissionRepository.replacePermissionsTransaction(
        roleId,
        permissionIds,
        isGranted
      );
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  /**
   * Revokes a specific permission assignment from a role.
   *
   * @throws {RolePermissionServiceError} If role is missing
   * @throws {ProtectedRoleMappingError} If target role is a system role
   * @throws {MappingNotFoundError} If mapping does not exist
   */
  public async removePermission(roleId: string, permissionId: string): Promise<void> {
    try {
      const role = await this.ensureRoleExists(roleId);
      this.ensureRoleIsNotProtected(role);
      await this.ensureRolePermissionExists(roleId, permissionId);

      await this.rolePermissionRepository.deleteMapping(roleId, permissionId);
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  // ==========================================
  // Private Business-Oriented Guards
  // ==========================================

  /**
   * Asserts that a role exists and returns its details.
   */
  private async ensureRoleExists(roleId: string): Promise<RoleDetails> {
    const role = await this.roleRepository.findRoleById(roleId);
    if (!role) {
      throw new RolePermissionServiceError(`Role with ID "${roleId}" was not found.`);
    }
    return role;
  }

  /**
   * Asserts that a role is active.
   */
  private ensureRoleIsActive(role: RoleDetails): void {
    if (!role.isActive) {
      throw new InvalidMappingStateError(
        `Role "${role.name}" is inactive. Mappings cannot be modified.`
      );
    }
  }

  /**
   * Asserts that a role is not system-protected.
   */
  private ensureRoleIsNotProtected(role: RoleDetails): void {
    if (role.isSystem) {
      throw new ProtectedRoleMappingError(
        `Role "${role.code}" is a protected system role and cannot be modified.`
      );
    }
  }

  /**
   * Asserts that a permission exists and returns its details.
   */
  private async ensurePermissionExists(permissionId: string): Promise<PermissionDetails> {
    const permission = await this.permissionRepository.findPermissionById(permissionId);
    if (!permission) {
      throw new RolePermissionServiceError(`Permission with ID "${permissionId}" was not found.`);
    }
    return permission;
  }

  /**
   * Asserts that a permission is active.
   */
  private ensurePermissionIsActive(permission: PermissionDetails): void {
    if (!permission.isActive) {
      throw new InvalidMappingStateError(
        `Permission "${permission.name}" is inactive. Mappings cannot be modified.`
      );
    }
  }

  /**
   * Asserts that all permissions in a list exist and are active.
   */
  private async ensurePermissionsExist(permissionIds: string[]): Promise<void> {
    for (const permissionId of permissionIds) {
      const permission = await this.ensurePermissionExists(permissionId);
      this.ensurePermissionIsActive(permission);
    }
  }

  /**
   * Asserts that a specific mapping exists.
   */
  private async ensureRolePermissionExists(roleId: string, permissionId: string): Promise<void> {
    const exists = await this.rolePermissionRepository.existsRolePermission(roleId, permissionId);
    if (!exists) {
      throw new MappingNotFoundError(
        `Mapping between role ID "${roleId}" and permission ID "${permissionId}" does not exist.`
      );
    }
  }

  /**
   * Maps underlying repository exception instances to Service-level equivalents.
   */
  private handleRepositoryError(error: unknown): never {
    if (error instanceof RolePermissionServiceError) {
      throw error;
    }
    if (
      error instanceof Error &&
      (error.name === 'RepositoryError' || error.name === 'RolePermissionRepositoryError')
    ) {
      throw new RolePermissionServiceError(error.message);
    }
    throw error as never;
  }
}
