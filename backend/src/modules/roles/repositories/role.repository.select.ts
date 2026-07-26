export const ROLE_SUMMARY_SELECT = {
  id: true,
  name: true,
  code: true,
  description: true,
  type: true,
  priority: true,
  isActive: true,
  isDefault: true,
  isSystem: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const;

export const ROLE_LIST_SELECT = {
  ...ROLE_SUMMARY_SELECT,
} as const;

export const ROLE_DETAILS_SELECT = {
  ...ROLE_SUMMARY_SELECT,
  rolePermissions: {
    where: {
      deletedAt: null,
      isGranted: true,
    },
    select: {
      permission: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  },
} as const;
