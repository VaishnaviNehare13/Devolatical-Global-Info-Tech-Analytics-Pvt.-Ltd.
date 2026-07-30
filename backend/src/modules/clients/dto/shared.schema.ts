import { z } from 'zod';
import { CLIENT_VALIDATION } from '../constants/client.constants';

export const ClientNameSchema = z
  .string({ required_error: 'Client name is required.' })
  .trim()
  .min(
    CLIENT_VALIDATION.NAME_MIN_LENGTH,
    `Client name must be at least ${CLIENT_VALIDATION.NAME_MIN_LENGTH} characters.`
  )
  .max(
    CLIENT_VALIDATION.NAME_MAX_LENGTH,
    `Client name must not exceed ${CLIENT_VALIDATION.NAME_MAX_LENGTH} characters.`
  );

export const ClientCodeSchema = z
  .string({ required_error: 'Client code is required.' })
  .trim()
  .min(
    CLIENT_VALIDATION.CODE_MIN_LENGTH,
    `Client code must be at least ${CLIENT_VALIDATION.CODE_MIN_LENGTH} characters.`
  )
  .max(
    CLIENT_VALIDATION.CODE_MAX_LENGTH,
    `Client code must not exceed ${CLIENT_VALIDATION.CODE_MAX_LENGTH} characters.`
  )
  .regex(
    /^[A-Z0-9_-]+$/,
    'Client code must contain only uppercase alphanumeric characters, dashes, and underscores.'
  );

export const ClientEmailSchema = z
  .string()
  .trim()
  .max(
    CLIENT_VALIDATION.EMAIL_MAX_LENGTH,
    `Email must not exceed ${CLIENT_VALIDATION.EMAIL_MAX_LENGTH} characters.`
  )
  .email('Invalid email address format.')
  .nullable();

export const ClientPhoneSchema = z
  .string()
  .trim()
  .max(
    CLIENT_VALIDATION.PHONE_MAX_LENGTH,
    `Phone number must not exceed ${CLIENT_VALIDATION.PHONE_MAX_LENGTH} characters.`
  )
  .nullable();

export const ClientWebsiteSchema = z
  .string()
  .trim()
  .max(
    CLIENT_VALIDATION.WEBSITE_MAX_LENGTH,
    `Website URL must not exceed ${CLIENT_VALIDATION.WEBSITE_MAX_LENGTH} characters.`
  )
  .url('Invalid website URL format.')
  .nullable();

export const ClientAddressLineSchema = z
  .string()
  .trim()
  .max(
    CLIENT_VALIDATION.ADDRESS_LINE_MAX_LENGTH,
    `Address line must not exceed ${CLIENT_VALIDATION.ADDRESS_LINE_MAX_LENGTH} characters.`
  )
  .nullable();

export const ClientCitySchema = z
  .string()
  .trim()
  .max(
    CLIENT_VALIDATION.CITY_MAX_LENGTH,
    `City name must not exceed ${CLIENT_VALIDATION.CITY_MAX_LENGTH} characters.`
  )
  .nullable();

export const ClientStateSchema = z
  .string()
  .trim()
  .max(
    CLIENT_VALIDATION.STATE_MAX_LENGTH,
    `State name must not exceed ${CLIENT_VALIDATION.STATE_MAX_LENGTH} characters.`
  )
  .nullable();

export const ClientCountrySchema = z
  .string()
  .trim()
  .max(
    CLIENT_VALIDATION.COUNTRY_MAX_LENGTH,
    `Country name must not exceed ${CLIENT_VALIDATION.COUNTRY_MAX_LENGTH} characters.`
  )
  .nullable();

export const ClientPostalCodeSchema = z
  .string()
  .trim()
  .max(
    CLIENT_VALIDATION.POSTAL_CODE_MAX_LENGTH,
    `Postal code must not exceed ${CLIENT_VALIDATION.POSTAL_CODE_MAX_LENGTH} characters.`
  )
  .nullable();

export const ClientNotesSchema = z
  .string()
  .trim()
  .max(
    CLIENT_VALIDATION.NOTES_MAX_LENGTH,
    `Notes must not exceed ${CLIENT_VALIDATION.NOTES_MAX_LENGTH} characters.`
  )
  .nullable();

export const AccountManagerIdSchema = z
  .string()
  .uuid('Account manager ID must be a valid UUID.')
  .nullable();
