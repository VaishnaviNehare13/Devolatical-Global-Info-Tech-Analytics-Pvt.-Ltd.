import { Module, Resource, Action } from '@prisma/client';

/**
 * System Permissions Constants
 */

export interface PermissionDefinition {
  name: string;
  code: string;
  description: string;
  module: Module;
  resource: Resource;
  action: Action;
  displayOrder: number;
}

export const IDENTITY_PERMISSIONS: PermissionDefinition[] = [
  // USER Permissions
  {
    name: 'Create User',
    code: 'USER_CREATE',
    description: 'Allows creating new user accounts.',
    module: Module.IDENTITY,
    resource: Resource.USER,
    action: Action.CREATE,
    displayOrder: 1,
  },
  {
    name: 'Read User',
    code: 'USER_READ',
    description: 'Allows viewing user profiles and lists.',
    module: Module.IDENTITY,
    resource: Resource.USER,
    action: Action.READ,
    displayOrder: 2,
  },
  {
    name: 'Update User',
    code: 'USER_UPDATE',
    description: 'Allows editing existing user accounts.',
    module: Module.IDENTITY,
    resource: Resource.USER,
    action: Action.UPDATE,
    displayOrder: 3,
  },
  {
    name: 'Delete User',
    code: 'USER_DELETE',
    description: 'Allows deleting or deactivating user accounts.',
    module: Module.IDENTITY,
    resource: Resource.USER,
    action: Action.DELETE,
    displayOrder: 4,
  },

  // ROLE Permissions
  {
    name: 'Create Role',
    code: 'ROLE_CREATE',
    description: 'Allows creating new system or custom roles.',
    module: Module.IDENTITY,
    resource: Resource.ROLE,
    action: Action.CREATE,
    displayOrder: 5,
  },
  {
    name: 'Read Role',
    code: 'ROLE_READ',
    description: 'Allows viewing roles and hierarchy settings.',
    module: Module.IDENTITY,
    resource: Resource.ROLE,
    action: Action.READ,
    displayOrder: 6,
  },
  {
    name: 'Update Role',
    code: 'ROLE_UPDATE',
    description: 'Allows modifying role properties and permissions.',
    module: Module.IDENTITY,
    resource: Resource.ROLE,
    action: Action.UPDATE,
    displayOrder: 7,
  },
  {
    name: 'Delete Role',
    code: 'ROLE_DELETE',
    description: 'Allows deleting non-system custom roles.',
    module: Module.IDENTITY,
    resource: Resource.ROLE,
    action: Action.DELETE,
    displayOrder: 8,
  },

  // PERMISSION Permissions
  {
    name: 'Create Permission',
    code: 'PERMISSION_CREATE',
    description: 'Allows creating new granular permissions.',
    module: Module.IDENTITY,
    resource: Resource.PERMISSION,
    action: Action.CREATE,
    displayOrder: 9,
  },
  {
    name: 'Read Permission',
    code: 'PERMISSION_READ',
    description: 'Allows listing and viewing permissions.',
    module: Module.IDENTITY,
    resource: Resource.PERMISSION,
    action: Action.READ,
    displayOrder: 10,
  },
  {
    name: 'Update Permission',
    code: 'PERMISSION_UPDATE',
    description: 'Allows updating permission details and configuration.',
    module: Module.IDENTITY,
    resource: Resource.PERMISSION,
    action: Action.UPDATE,
    displayOrder: 11,
  },
  {
    name: 'Delete Permission',
    code: 'PERMISSION_DELETE',
    description: 'Allows removing access permissions from the system.',
    module: Module.IDENTITY,
    resource: Resource.PERMISSION,
    action: Action.DELETE,
    displayOrder: 12,
  },
];
