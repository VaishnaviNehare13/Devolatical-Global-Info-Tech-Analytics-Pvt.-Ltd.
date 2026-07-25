import { IAuthRepository } from '../repositories/auth.repository.interface';
import { IAuthService } from './auth.service.interface';
import { LoginResult } from '../types/auth.service.types';
import { AuthenticatedUser, UserStatus } from '../types/auth.types';
import { AuthenticationError } from '../types/auth.service.errors';
import { comparePassword } from '../../../shared/utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../../shared/utils/jwt';
import { AuthMapper } from '../mappers/auth.mapper';

/**
 * Concrete Authentication Business Service implementing IAuthService.
 * Coordinates credentials validation, status checks, and session tokens generation/refresh.
 */
export class AuthService implements IAuthService {
  constructor(private readonly authRepository: IAuthRepository) {}

  /**
   * Executes the credentials login flow.
   *
   * @param email Plain text user email
   * @param password Plain text user password
   * @returns Immutable LoginResult with token pair and identity
   * @throws {AuthenticationError} For business authentication failures
   */
  public async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.validateCredentials(email, password);

    this.ensureAccountIsActive(user.status);

    const tokens = this.generateTokenPair(user.id, user.email);

    await this.updateLastLogin(user.id);

    return AuthMapper.toLoginResult(tokens.accessToken, tokens.refreshToken, user);
  }

  /**
   * Executes token refresh and rotation flow.
   *
   * @param token Refresh token string
   * @returns Immutable LoginResult with rotated token pair and identity
   * @throws {AuthenticationError} For token validation failures
   */
  public async refreshToken(token: string): Promise<LoginResult> {
    const payload = this.validateRefreshTokenClaims(token);

    let user = null;
    try {
      user = await this.authRepository.findUserById(payload.sub);
    } catch (error) {
      throw new AuthenticationError(
        'INVALID_CREDENTIALS',
        'Session refresh failed during account query.',
        error
      );
    }

    if (!user) {
      throw new AuthenticationError(
        'ACCOUNT_NOT_FOUND',
        'Session refresh failed. Account not found.'
      );
    }

    this.ensureAccountIsActive(user.status);

    const tokens = this.generateTokenPair(user.id, user.email);

    await this.updateLastLogin(user.id);

    return AuthMapper.toLoginResult(tokens.accessToken, tokens.refreshToken, user);
  }

  /**
   * Terminates user sessions and triggers necessary token revocations.
   *
   * @param userId The unique user identifier
   * @throws {AuthenticationError} For business validation or query failures
   */
  public async logout(userId: string): Promise<void> {
    // Current stateless JWT implementation is a no-op placeholder.
    // This design allows future token revocation stores (e.g. database, redis lists)
    // to be integrated seamlessly without breaking public interface consumers.
    try {
      const userExists = await this.authRepository.findUserById(userId);
      if (!userExists) {
        throw new AuthenticationError(
          'ACCOUNT_NOT_FOUND',
          'Session termination failed. User not found.'
        );
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(
        'INVALID_CREDENTIALS',
        'Session termination failed during account validation.',
        error
      );
    }
  }

  /**
   * Decodes and asserts validity of refresh token claims.
   */
  private validateRefreshTokenClaims(token: string) {
    const result = verifyRefreshToken(token);

    if (!result.success) {
      let message = 'Invalid refresh token.';
      if (result.error === 'EXPIRED') {
        message = 'Refresh token has expired.';
      } else if (result.error === 'MALFORMED') {
        message = 'Refresh token is malformed.';
      }
      throw new AuthenticationError('INVALID_CREDENTIALS', message);
    }

    return result.payload;
  }

  /**
   * Validates plain-text credentials against repository hashes.
   */
  private async validateCredentials(email: string, password: string): Promise<AuthenticatedUser> {
    let user: AuthenticatedUser | null = null;

    try {
      user = await this.authRepository.findUserByEmail(email);
    } catch (error) {
      throw new AuthenticationError(
        'INVALID_CREDENTIALS',
        'Authentication failed during account lookup.',
        error
      );
    }

    if (!user) {
      throw new AuthenticationError(
        'ACCOUNT_NOT_FOUND',
        'Authentication failed. Account not found.'
      );
    }

    try {
      const isPasswordMatch = await comparePassword(password, user.passwordHash);
      if (!isPasswordMatch) {
        throw new AuthenticationError(
          'INVALID_PASSWORD',
          'Authentication failed. Invalid password.'
        );
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(
        'INVALID_CREDENTIALS',
        'Authentication failed during credentials verification.',
        error
      );
    }

    return user;
  }

  /**
   * Asserts the user account status allows authorization.
   */
  private ensureAccountIsActive(status: UserStatus): void {
    if (status !== 'ACTIVE') {
      if (status === 'SUSPENDED') {
        throw new AuthenticationError('ACCOUNT_LOCKED', 'Access denied. Account is suspended.');
      }
      throw new AuthenticationError(
        'ACCOUNT_DISABLED',
        `Access denied. Account status is ${status}.`
      );
    }
  }

  /**
   * Generates Access and Refresh token pairs.
   */
  private generateTokenPair(
    userId: string,
    email: string
  ): { accessToken: string; refreshToken: string } {
    try {
      const payload = { sub: userId, email };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      return { accessToken, refreshToken };
    } catch (error) {
      throw new AuthenticationError(
        'INVALID_CREDENTIALS',
        'Authentication succeeded, but session tokens generation failed.',
        error
      );
    }
  }

  /**
   * Updates last login timestamp on credentials table.
   */
  private async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.authRepository.updateLastLogin(userId);
    } catch (error) {
      throw new AuthenticationError(
        'INVALID_CREDENTIALS',
        'Authentication succeeded, but failed to register login time.',
        error
      );
    }
  }
}
