export const ROLE_PERMISSION_SELECT = {
  id: true,
  roleId: true,
  permissionId: true,
  isGranted: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  role: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  permission: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
} as const;
