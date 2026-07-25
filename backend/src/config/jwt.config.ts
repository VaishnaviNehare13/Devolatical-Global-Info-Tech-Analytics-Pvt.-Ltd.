import { Algorithm } from 'jsonwebtoken';
import { config } from './env';
import { deepFreeze } from '../shared/utils/deep-freeze';
import { JwtExpiresIn } from '../shared/types/jwt.types';

export interface JwtConfig {
  access: {
    secret: string;
    expiresIn: JwtExpiresIn;
  };
  refresh: {
    secret: string;
    expiresIn: JwtExpiresIn;
  };
  issuer: string;
  audience: string;
  algorithm: Algorithm;
}

/**
 * Enterprise JWT Configuration Domain
 *
 * Maps configurations specifically for JWT token generation and verification.
 * Enforces deep runtime immutability.
 */
const rawJwtConfig: JwtConfig = {
  access: {
    secret: config.jwt.accessSecret,
    expiresIn: config.jwt.accessExpiresIn as JwtExpiresIn,
  },
  refresh: {
    secret: config.jwt.refreshSecret,
    expiresIn: config.jwt.refreshExpiresIn as JwtExpiresIn,
  },
  issuer: config.jwt.issuer,
  audience: config.jwt.audience,
  algorithm: config.jwt.algorithm as Algorithm,
};

export const jwtConfig = deepFreeze(rawJwtConfig);

export type JwtConfigType = typeof jwtConfig;
