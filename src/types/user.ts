import type { BaseQueryParams } from './api';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export interface UserRoleSummary {
  id: string;
  name: string;
  code: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  displayName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  roles: UserRoleSummary[];
}

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  status: UserStatus;
  avatarUrl: string | null;
  createdAt: string;
  roles: UserRoleSummary[];
}

export interface UpdateProfileRequest {
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  displayName?: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
}

export interface FindUsersQuery extends BaseQueryParams {
  status?: UserStatus;
  roleId?: string;
  includeDeleted?: boolean;
  sortField?: 'createdAt' | 'displayName' | 'email';
}
