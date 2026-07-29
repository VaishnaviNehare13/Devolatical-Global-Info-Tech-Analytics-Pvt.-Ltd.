/**
 * Centralized Prisma Select configurations for Client queries.
 */

export const CLIENT_BASE_SELECT = {
  id: true,
  name: true,
  code: true,
  email: true,
  phone: true,
  status: true,
  createdAt: true,
} as const;

export const CLIENT_DETAIL_SELECT = {
  ...CLIENT_BASE_SELECT,
  website: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  state: true,
  country: true,
  postalCode: true,
  notes: true,
  accountManagerId: true,
  createdById: true,
  updatedAt: true,
  updatedById: true,
  deletedAt: true,
} as const;
