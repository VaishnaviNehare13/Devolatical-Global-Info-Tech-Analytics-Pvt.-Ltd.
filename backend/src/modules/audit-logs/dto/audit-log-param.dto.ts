import { IdParamSchema, IdParamDto } from '../../../shared/dto/id-param.dto';

/**
 * Zod validation schema for single audit log request parameter.
 * Reuses the system-wide IdParamSchema to validate IDs as UUIDs.
 */
export const AuditLogParamSchema = IdParamSchema;
export type AuditLogParamDto = IdParamDto;
