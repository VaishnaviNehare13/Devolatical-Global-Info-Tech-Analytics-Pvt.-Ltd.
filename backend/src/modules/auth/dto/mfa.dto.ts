import { z } from 'zod';

export const VerifyMfaSchema = z.object({
  code: z
    .string({ required_error: 'TOTP code is required.' })
    .length(6, { message: 'TOTP code must be exactly 6 digits.' })
    .regex(/^\d{6}$/, { message: 'TOTP code must contain numbers only.' }),
});

export const DisableMfaSchema = z.object({
  password: z.string().optional(),
  code: z.string().optional(),
});

export const VerifyMfaLoginSchema = z.object({
  mfaToken: z.string({ required_error: 'MFA challenge token is required.' }),
  code: z
    .string({ required_error: 'TOTP code is required.' })
    .length(6, { message: 'TOTP code must be exactly 6 digits.' })
    .regex(/^\d{6}$/, { message: 'TOTP code must contain numbers only.' }),
});

export type VerifyMfaDto = z.infer<typeof VerifyMfaSchema>;
export type DisableMfaDto = z.infer<typeof DisableMfaSchema>;
export type VerifyMfaLoginDto = z.infer<typeof VerifyMfaLoginSchema>;
