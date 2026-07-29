import { z } from 'zod';
import { AuditModule, AuditAction, AuditStatus, AuditSeverity } from '@prisma/client';

/**
 * Reusable Zod schemas for Audit Logs Prisma native enums.
 */
export const AuditModuleSchema = z.nativeEnum(AuditModule);
export const AuditActionSchema = z.nativeEnum(AuditAction);
export const AuditStatusSchema = z.nativeEnum(AuditStatus);
export const AuditSeveritySchema = z.nativeEnum(AuditSeverity);

/**
 * Reusable Zod schema to validate arbitrary JSON payloads recursively.
 * Supports primitives, arrays, and nested key-value records.
 */
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];

export const JsonValueSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(JsonValueSchema), z.record(JsonValueSchema)])
);
