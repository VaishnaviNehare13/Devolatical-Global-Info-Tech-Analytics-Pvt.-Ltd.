export const PERMISSION_SUMMARY_SELECT = {
  id: true,
  name: true,
  code: true,
  description: true,
  module: true,
  resource: true,
  action: true,
  isActive: true,
  isSystem: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const;

export const PERMISSION_LIST_SELECT = {
  ...PERMISSION_SUMMARY_SELECT,
} as const;

export const PERMISSION_DETAILS_SELECT = {
  ...PERMISSION_SUMMARY_SELECT,
  rolePermissions: {
    where: {
      deletedAt: null,
      isGranted: true,
    },
    select: {
      role: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  },
} as const;
