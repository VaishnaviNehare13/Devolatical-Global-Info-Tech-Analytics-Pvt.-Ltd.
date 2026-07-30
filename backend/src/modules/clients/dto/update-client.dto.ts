import { z } from 'zod';
import { ClientStatus } from '@prisma/client';
import {
  ClientNameSchema,
  ClientCodeSchema,
  ClientEmailSchema,
  ClientPhoneSchema,
  ClientWebsiteSchema,
  ClientAddressLineSchema,
  ClientCitySchema,
  ClientStateSchema,
  ClientCountrySchema,
  ClientPostalCodeSchema,
  ClientNotesSchema,
  AccountManagerIdSchema,
} from './shared.schema';

/**
 * Zod validation schema for updating Client records.
 * Uses strict mode and requires at least one field to be present.
 */
export const UpdateClientSchema = z
  .object({
    name: ClientNameSchema.optional(),
    code: z
      .preprocess((val) => (typeof val === 'string' ? val.toUpperCase() : val), ClientCodeSchema)
      .optional(),
    email: ClientEmailSchema.optional(),
    phone: ClientPhoneSchema.optional(),
    website: ClientWebsiteSchema.optional(),
    addressLine1: ClientAddressLineSchema.optional(),
    addressLine2: ClientAddressLineSchema.optional(),
    city: ClientCitySchema.optional(),
    state: ClientStateSchema.optional(),
    country: ClientCountrySchema.optional(),
    postalCode: ClientPostalCodeSchema.optional(),
    notes: ClientNotesSchema.optional(),
    status: z.nativeEnum(ClientStatus).optional(),
    accountManagerId: AccountManagerIdSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  });

export type UpdateClientDto = z.infer<typeof UpdateClientSchema>;
