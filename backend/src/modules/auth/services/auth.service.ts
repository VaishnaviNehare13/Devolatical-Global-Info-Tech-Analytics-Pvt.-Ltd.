import { IAuthRepository } from '../repositories/auth.repository.interface';
import { IAuthService } from './auth.service.interface';
import { LoginResult } from '../types/auth.service.types';
import { AuthenticatedUser, UserStatus } from '../types/auth.types';
import { AuthenticationError } from '../types/auth.service.errors';
import { comparePassword } from '../../../shared/utils/password';
import { generateAccessToken, generateRefreshToken } from '../../../shared/utils/jwt';
import { AuthMapper } from '../mappers/auth.mapper';

/**
 * Concrete Authentication Business Service implementing IAuthService.
 * Coordinates credentials validation, status checks, and session tokens generation.
 */
export class AuthService implements IAuthService {
  constructor(private readonly authRepository: IAuthRepository) {}

  /**
   * Executes the authentication login flow.
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
