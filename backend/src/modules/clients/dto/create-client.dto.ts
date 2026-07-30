import { z } from 'zod';
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
 * Zod validation schema for creating a new Client record.
 * Automatically normalizes alphanumeric shorthand codes to uppercase.
 */
export const CreateClientSchema = z
  .object({
    name: ClientNameSchema,
    code: z.preprocess(
      (val) => (typeof val === 'string' ? val.toUpperCase() : val),
      ClientCodeSchema
    ),
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
    accountManagerId: AccountManagerIdSchema.optional(),
  })
  .strict();

export type CreateClientDto = z.infer<typeof CreateClientSchema>;
