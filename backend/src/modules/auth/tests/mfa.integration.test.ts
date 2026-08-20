import request from 'supertest';
import express from 'express';
import { generateTotpCode } from '../utils/totp.util';
import { prisma } from '../../../config/db';
import { generateAccessToken } from '../../../shared/utils/jwt';
import { AuthMiddleware } from '../../../middleware/auth.middleware';
import { AuthRepository } from '../repositories/auth.repository';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { createAuthRouter } from '../routes/auth.routes';
import { createPasswordHash } from '../../../shared/utils/password';
import { errorHandler } from '../../../middleware/errorHandler';

describe('MFA / 2FA TOTP Authentication Integration Tests', () => {
  let testApp: express.Application;
  let testUserToken: string;
  let testUserId: string;
  let testUserEmail: string;
  const rawPassword = 'Password123!';
  let generatedSecret: string;
  let mfaLoginChallengeToken: string;

  beforeAll(async () => {
    // 1. Create Test User
    testUserEmail = `mfa.user.${Date.now()}@example.com`;
    const passwordHash = await createPasswordHash(rawPassword);

    const user = await prisma.user.create({
      data: {
        firstName: 'MFA',
        lastName: 'TestUser',
        displayName: 'MFA Test User',
        email: testUserEmail,
        status: 'ACTIVE',
        credentials: {
          create: {
            passwordHash,
          },
        },
        preference: {
          create: {
            twoFactorEnabled: false,
          },
        },
      },
    });

    testUserId = user.id;
    testUserToken = generateAccessToken({ sub: user.id, email: user.email });

    // 2. Setup Express App with Auth Router
    testApp = express();
    testApp.use(express.json());

    const authRepository = new AuthRepository();
    const authService = new AuthService(authRepository);
    const authController = new AuthController(authService);
    const authMiddleware = new AuthMiddleware(authRepository);

    const authRouter = createAuthRouter(authController, authMiddleware.handle);
    testApp.use('/api/v1/auth', authRouter);
    testApp.use(errorHandler);
  });

  afterAll(async () => {
    await prisma.userPreference.deleteMany({ where: { userId: testUserId } });
    await prisma.credential.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
  });

  describe('1. MFA Status & Setup', () => {
    it('should return MFA disabled by default via GET /api/v1/auth/mfa/status', async () => {
      const res = await request(testApp)
        .get('/api/v1/auth/mfa/status')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.enabled).toBe(false);
    });

    it('should initiate MFA setup via POST /api/v1/auth/mfa/setup', async () => {
      const res = await request(testApp)
        .post('/api/v1/auth/mfa/setup')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.secret).toBeDefined();
      expect(res.body.data.otpauthUrl).toBeDefined();
      expect(res.body.data.qrCodeUrl).toBeDefined();

      generatedSecret = res.body.data.secret;
    });

    it('should DENY unauthenticated access to MFA setup with 401', async () => {
      const res = await request(testApp).post('/api/v1/auth/mfa/setup');
      expect(res.status).toBe(401);
    });
  });

  describe('2. MFA Verification & Activation', () => {
    it('should REJECT invalid TOTP verification code with 401 Unauthorized', async () => {
      const res = await request(testApp)
        .post('/api/v1/auth/mfa/verify')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ code: '000000' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should VERIFY valid TOTP code and enable MFA via POST /api/v1/auth/mfa/verify', async () => {
      const validCode = generateTotpCode(generatedSecret);

      const res = await request(testApp)
        .post('/api/v1/auth/mfa/verify')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ code: validCode });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.enabled).toBe(true);

      // Verify status now returns enabled = true
      const statusRes = await request(testApp)
        .get('/api/v1/auth/mfa/status')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(statusRes.body.data.enabled).toBe(true);
    });
  });

  describe('3. Login Flow with MFA Enabled', () => {
    it('should return MFA Challenge Response instead of access tokens when MFA is enabled', async () => {
      const res = await request(testApp)
        .post('/api/v1/auth/login')
        .send({
          email: testUserEmail,
          password: rawPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.mfaRequired).toBe(true);
      expect(res.body.data.mfaToken).toBeDefined();
      expect(res.body.data.accessToken).toBeUndefined();

      mfaLoginChallengeToken = res.body.data.mfaToken;
    });

    it('should REJECT invalid TOTP code for MFA challenge login with 401 Unauthorized', async () => {
      const res = await request(testApp)
        .post('/api/v1/auth/mfa/login')
        .send({
          mfaToken: mfaLoginChallengeToken,
          code: '999999',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should ACCEPT valid TOTP code and return full tokens via POST /api/v1/auth/mfa/login', async () => {
      const validCode = generateTotpCode(generatedSecret);

      const res = await request(testApp)
        .post('/api/v1/auth/mfa/login')
        .send({
          mfaToken: mfaLoginChallengeToken,
          code: validCode,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe(testUserEmail);
    });
  });

  describe('4. MFA Disabling & Regression Verification', () => {
    it('should REJECT disabling MFA with wrong password', async () => {
      const res = await request(testApp)
        .post('/api/v1/auth/mfa/disable')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ password: 'WrongPassword123!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should DISABLE MFA successfully with correct password', async () => {
      const res = await request(testApp)
        .post('/api/v1/auth/mfa/disable')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ password: rawPassword });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.enabled).toBe(false);
    });

    it('should execute standard password login directly after MFA is disabled', async () => {
      const res = await request(testApp)
        .post('/api/v1/auth/login')
        .send({
          email: testUserEmail,
          password: rawPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.mfaRequired).toBeUndefined();
    });
  });
});
