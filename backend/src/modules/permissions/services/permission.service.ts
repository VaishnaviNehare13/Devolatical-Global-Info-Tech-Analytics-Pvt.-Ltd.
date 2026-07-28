import { IPermissionRepository } from '../repositories/permission.repository.interface';
import {
  PermissionDetails,
  PermissionSummary,
  FindPermissionsOptions,
  PaginatedPermissions,
  CreatePermissionData,
  UpdatePermissionData,
} from '../types/permission.types';
import {
  PermissionServiceError,
  PermissionNotFoundError,
  DuplicatePermissionNameError,
  DuplicatePermissionCodeError,
  ProtectedPermissionError,
  InvalidPermissionUpdateError,
} from '../types/permission.service.errors';

/**
 * Concrete service layer class responsible for orchestrating Permissions business logic.
 * Encapsulates all policy controls, state transition assertions, and validation rules.
 * Completely independent of Express, HTTP context, and ORMs.
 */
export class PermissionService {
  constructor(private readonly repository: IPermissionRepository) {}

  /**
   * Queries paginated, filtered, and sorted list of permissions.
   */
  public async getPermissions(options: FindPermissionsOptions): Promise<PaginatedPermissions> {
    try {
      return await this.repository.findPermissions(options);
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  /**
   * Retrieves summary details of a permission by ID.
   *
   * @throws {PermissionNotFoundError} If permission is deleted or missing
   */
  public async getPermissionById(id: string): Promise<PermissionDetails> {
    try {
      return await this.ensurePermissionExists(id);
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  /**
   * Handles creating a new permission.
   *
   * @throws {DuplicatePermissionNameError} If name conflicts with an existing permission
   * @throws {DuplicatePermissionCodeError} If code conflicts with an existing permission
   */
  public async createPermission(data: CreatePermissionData): Promise<PermissionDetails> {
    try {
      await this.ensurePermissionNameAvailable(data.name);
      await this.ensurePermissionCodeAvailable(data.code);

      return await this.repository.createPermission(data);
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  /**
   * Handles updating fields of an existing permission.
   *
   * @throws {PermissionNotFoundError} If permission is deleted or missing
   * @throws {InvalidPermissionUpdateError} If client attempts to update immutable fields (code, isSystem)
   * @throws {ProtectedPermissionError} If trying to rename or modify a protected system permission
   * @throws {DuplicatePermissionNameError} If new name conflicts with another permission
   */
  public async updatePermission(
    id: string,
    data: UpdatePermissionData
  ): Promise<PermissionDetails> {
    try {
      // Validate that client is not attempting to update immutable fields
      const rawData = data as Record<string, unknown>;
      if (rawData.code !== undefined || rawData.isSystem !== undefined) {
        throw new InvalidPermissionUpdateError('Cannot update immutable fields: code, isSystem.');
      }

      const permission = await this.ensurePermissionExists(id);

      // Prevent modification of protected/system permissions
      if (permission.isSystem) {
        this.ensurePermissionCanUpdate(permission);
      }

      // Check duplicate names when applicable
      if (data.name !== undefined && data.name !== permission.name) {
        await this.ensurePermissionNameAvailable(data.name, id);
      }

      return await this.repository.updatePermission(id, data);
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  /**
   * Handles soft deleting permissions.
   *
   * @throws {PermissionNotFoundError} If permission is deleted or missing
   * @throws {ProtectedPermissionError} If trying to delete system permissions
   */
  public async deletePermission(id: string): Promise<void> {
    try {
      const permission = await this.ensurePermissionExists(id);
      this.ensurePermissionCanDelete(permission);

      await this.repository.softDeletePermission(id);
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  // ==========================================
  // Private Business-Oriented Guards
  // ==========================================

  /**
   * Asserts that a permission exists and returns its details.
   */
  private async ensurePermissionExists(id: string): Promise<PermissionDetails> {
    const permission = await this.repository.findPermissionById(id);
    if (!permission) {
      throw new PermissionNotFoundError(`Permission with ID "${id}" was not found.`);
    }
    return permission;
  }

  /**
   * Asserts that a permission is eligible for updates (blocks system permission modifications).
   */
  private ensurePermissionCanUpdate(permission: PermissionSummary): void {
    if (permission.isSystem) {
      throw new ProtectedPermissionError(
        `Permission "${permission.code}" is a protected system permission and cannot be modified.`
      );
    }
  }

  /**
   * Asserts that a permission is eligible for deletion (blocks system permission deletes).
   */
  private ensurePermissionCanDelete(permission: PermissionSummary): void {
    if (permission.isSystem) {
      throw new ProtectedPermissionError(
        `Permission "${permission.code}" is a protected system permission and cannot be deleted.`
      );
    }
  }

  /**
   * Asserts that a permission code is unique, ignoring a specified ID if updating.
   */
  private async ensurePermissionCodeAvailable(code: string, excludeId?: string): Promise<void> {
    const existingPermission = await this.repository.findPermissionByCode(code);
    if (existingPermission && (!excludeId || existingPermission.id !== excludeId)) {
      throw new DuplicatePermissionCodeError(`Permission code "${code}" is already in use.`);
    }
  }

  /**
   * Asserts that a permission name is unique, ignoring a specified ID if updating.
   */
  private async ensurePermissionNameAvailable(name: string, excludeId?: string): Promise<void> {
    const existingPermission = await this.repository.findPermissionByName(name);
    if (existingPermission && (!excludeId || existingPermission.id !== excludeId)) {
      throw new DuplicatePermissionNameError(`Permission name "${name}" is already in use.`);
    }
  }

  /**
   * Maps underlying repository exception instances to Service-level equivalents.
   */
  private handleRepositoryError(error: unknown): never {
    if (error instanceof PermissionServiceError) {
      throw error;
    }
    if (
      error instanceof Error &&
      (error.name === 'RepositoryError' || error.name === 'PermissionRepositoryError')
    ) {
      throw new PermissionServiceError(error.message);
    }
    throw error as never;
  }
}
