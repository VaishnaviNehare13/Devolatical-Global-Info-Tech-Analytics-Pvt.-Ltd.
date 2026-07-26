import { z } from 'zod';
import { ROLE_VALIDATION } from '../constants/role.constants';

export const RoleNameSchema = z
  .string({ required_error: 'Role name is required.' })
  .trim()
  .min(
    ROLE_VALIDATION.NAME_MIN_LENGTH,
    `Role name must be at least ${ROLE_VALIDATION.NAME_MIN_LENGTH} characters.`
  )
  .max(
    ROLE_VALIDATION.NAME_MAX_LENGTH,
    `Role name must not exceed ${ROLE_VALIDATION.NAME_MAX_LENGTH} characters.`
  );

export const RoleCodeSchema = z
  .string({ required_error: 'Role code is required.' })
  .trim()
  .min(
    ROLE_VALIDATION.CODE_MIN_LENGTH,
    `Role code must be at least ${ROLE_VALIDATION.CODE_MIN_LENGTH} characters.`
  )
  .max(
    ROLE_VALIDATION.CODE_MAX_LENGTH,
    `Role code must not exceed ${ROLE_VALIDATION.CODE_MAX_LENGTH} characters.`
  )
  .regex(
    /^[A-Z0-9_]+$/,
    'Role code must contain only uppercase alphanumeric characters and underscores.'
  );

export const DescriptionSchema = z
  .string()
  .trim()
  .max(
    ROLE_VALIDATION.DESCRIPTION_MAX_LENGTH,
    `Description must not exceed ${ROLE_VALIDATION.DESCRIPTION_MAX_LENGTH} characters.`
  )
  .nullable();

export const PrioritySchema = z
  .number()
  .int('Priority must be an integer.')
  .min(ROLE_VALIDATION.PRIORITY_MIN, `Priority must be at least ${ROLE_VALIDATION.PRIORITY_MIN}.`);
