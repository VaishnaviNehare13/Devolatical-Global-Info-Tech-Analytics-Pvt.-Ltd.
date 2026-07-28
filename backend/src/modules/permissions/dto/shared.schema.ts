import { z } from 'zod';
import { PERMISSION_VALIDATION } from '../constants/permission.constants';

export const PermissionNameSchema = z
  .string({ required_error: 'Permission name is required.' })
  .trim()
  .min(
    PERMISSION_VALIDATION.NAME_MIN_LENGTH,
    `Permission name must be at least ${PERMISSION_VALIDATION.NAME_MIN_LENGTH} characters.`
  )
  .max(
    PERMISSION_VALIDATION.NAME_MAX_LENGTH,
    `Permission name must not exceed ${PERMISSION_VALIDATION.NAME_MAX_LENGTH} characters.`
  );

export const PermissionCodeSchema = z
  .string({ required_error: 'Permission code is required.' })
  .trim()
  .min(
    PERMISSION_VALIDATION.CODE_MIN_LENGTH,
    `Permission code must be at least ${PERMISSION_VALIDATION.CODE_MIN_LENGTH} characters.`
  )
  .max(
    PERMISSION_VALIDATION.CODE_MAX_LENGTH,
    `Permission code must not exceed ${PERMISSION_VALIDATION.CODE_MAX_LENGTH} characters.`
  )
  .regex(
    /^[A-Z0-9_]+$/,
    'Permission code must contain only uppercase alphanumeric characters and underscores.'
  );

export const PermissionDescriptionSchema = z
  .string()
  .trim()
  .max(
    PERMISSION_VALIDATION.DESCRIPTION_MAX_LENGTH,
    `Description must not exceed ${PERMISSION_VALIDATION.DESCRIPTION_MAX_LENGTH} characters.`
  )
  .nullable();

export const PermissionModuleSchema = z.enum([
  'IDENTITY',
  'CRM',
  'PROJECT',
  'SUPPORT',
  'FINANCE',
  'CAREER',
  'CMS',
  'ANALYTICS',
  'NOTIFICATION',
  'SYSTEM',
] as const);

export const PermissionResourceSchema = z.enum([
  'USER',
  'ROLE',
  'PERMISSION',
  'PROJECT',
  'TASK',
  'CLIENT',
  'EMPLOYEE',
  'JOB',
  'APPLICATION',
  'REPORT',
  'INVOICE',
  'PAYMENT',
  'DASHBOARD',
] as const);

export const PermissionActionSchema = z.enum([
  'CREATE',
  'READ',
  'UPDATE',
  'DELETE',
  'APPROVE',
  'ASSIGN',
  'EXPORT',
  'IMPORT',
  'DOWNLOAD',
  'PUBLISH',
] as const);

export const PermissionDisplayOrderSchema = z
  .number()
  .int('Display order must be an integer.')
  .min(
    PERMISSION_VALIDATION.DISPLAY_ORDER_MIN,
    `Display order must be at least ${PERMISSION_VALIDATION.DISPLAY_ORDER_MIN}.`
  );
