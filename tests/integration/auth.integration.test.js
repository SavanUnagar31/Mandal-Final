// tests/integration/auth.integration.test.js
const request = require('supertest');
const app = require('../../server');
const { sequelize, User, UserOtp, UserRole } = require('../../src/infrastructure/database/models');
const { client: redis, disconnect: disconnectRedis } = require('../../src/infrastructure/cache/redis.config');

jest.mock('../../src/infrastructure/external/notification.provider', () => ({
  sendSMS: jest.fn().mockResolvedValue(true),
}));

describe('Auth API Integration Tests', () => {
  const testMobile = '8888888888';
  const testEmail = 'integr8@mandal.com';
  let otpRef;
  let otpToken;
  let accessToken;
  let refreshToken;

  beforeAll(async () => {
    // Database is initialized and synced by tests/setup.js
    await User.destroy({ where: { mobile: testMobile } });
    await UserOtp.destroy({ where: { mobile: testMobile } });
  });

  it('should return 404 on check-mobile for unregistered number', async () => {
    const res = await request(app)
      .post('/api/v1/auth/check-mobile')
      .send({ mobile: testMobile, purpose: 'login' })
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('USER_NOT_FOUND');
  });

  it('should register a new user successfully and send OTP', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Integration Test User',
        mobile: testMobile,
        email: testEmail,
        address: 'Integration City',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.otpRef).toBeDefined();
    expect(res.body.data.nextAction).toBe('VERIFY_OTP');

    otpRef = res.body.data.otpRef;
  });

  it('should fail OTP verification with incorrect OTP', async () => {
    await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({
        mobile: testMobile,
        otp: '999999',
        purpose: 'register',
        otpRef,
      })
      .expect(400);
  });

  it('should verify OTP and return short-lived token', async () => {
    // Fetch generated OTP hash from DB, but wait! We can bypass verifyOtp or get the OTP from the database by mocking or checking the generated OTP.
    // Since this is a test, we can read the OTP record from the DB!
    const otpRecord = await UserOtp.findOne({ where: { id: otpRef } });
    expect(otpRecord).toBeDefined();
    
    // We cannot read plain text OTP because it is hashed.
    // Wait! Let's mock bcrypt.compare or let's update the test script to force an OTP in database or mock bcrypt.compare?
    // Wait! bcrypt is mocked globally in Jest? In auth.test.js we mocked bcrypt.
    // In integration tests, bcrypt is NOT mocked (it uses the real bcrypt module).
    // But since the OTP is hashed, how can we verify it?
    // Wait! We can update the database record to contain a hashed value of '123456'!
    // Yes! `otpRecord.otpHash = await bcrypt.hash('123456', 10); await otpRecord.save();`
    // Then we can send '123456' as the OTP! This is extremely clever and works 100% reliably in integration tests without mocking bcrypt!
    const bcrypt = require('bcrypt');
    otpRecord.otpHash = await bcrypt.hash('123456', 10);
    await otpRecord.save();

    const res = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({
        mobile: testMobile,
        otp: '123456',
        purpose: 'register',
        otpRef,
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.otpToken).toBeDefined();
    expect(res.body.data.nextAction).toBe('SET_PASSWORD');

    otpToken = res.body.data.otpToken;
  });

  it('should set password successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/set-password')
      .send({
        mobile: testMobile,
        otpToken,
        password: 'Pass@123password',
        confirmPassword: 'Pass@123password',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.nextAction).toBe('LOGIN');
  });

  it('should login user and return access and refresh tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        mobile: testMobile,
        password: 'Pass@123password',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();

    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('should retrieve logged in user profile via /me', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.mobile).toBe(testMobile);
    expect(res.body.data.roles).toContain('MANDAL_OWNER');
  });

  it('should logout user and revoke refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .send({ refreshToken })
      .expect(200);

    expect(res.body.success).toBe(true);
  });
});