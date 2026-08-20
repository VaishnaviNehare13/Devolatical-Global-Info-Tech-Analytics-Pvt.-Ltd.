import { z } from 'zod';
import { InvoiceStatus } from '@prisma/client';

export const InvoiceIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid Invoice ID format. Must be a valid UUID.' }),
});

export const CreateInvoiceSchema = z.object({
  invoiceNumber: z.string().min(3, { message: 'Invoice number must be at least 3 characters long.' }),
  description: z.string().optional(),
  amount: z.coerce.number().positive({ message: 'Invoice amount must be positive.' }),
  currency: z.string().default('USD'),
  status: z.nativeEnum(InvoiceStatus).default(InvoiceStatus.PENDING),
  dueDate: z.coerce.date().optional(),
  clientId: z.string().uuid({ message: 'Client ID must be a valid UUID.' }),
  projectId: z.string().uuid({ message: 'Project ID must be a valid UUID.' }).optional(),
});

export const UpdateInvoiceSchema = z.object({
  description: z.string().optional(),
  amount: z.coerce.number().positive().optional(),
  currency: z.string().optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  dueDate: z.coerce.date().optional(),
  paidAt: z.coerce.date().optional(),
});

export const FindInvoicesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  clientId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  sortField: z.enum(['createdAt', 'amount', 'dueDate', 'invoiceNumber']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>;
export type FindInvoicesInput = z.infer<typeof FindInvoicesSchema>;
