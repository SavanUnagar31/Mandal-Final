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
  let token;
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
      .send({ mobile: testMobile })
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
    expect(res.body.data.token).toBeDefined();

    token = res.body.data.token;
  });

  it('should fail OTP verification with incorrect OTP', async () => {
    await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({
        token,
        otp: '999999',
      })
      .expect(400);
  });

  it('should verify OTP and return short-lived token', async () => {
    // Fetch generated OTP hash from DB
    const otpRecord = await UserOtp.findOne({ where: { mobile: testMobile }, order: [['createdAt', 'DESC']] });
    expect(otpRecord).toBeDefined();
    otpRef = otpRecord.id;
    
    const bcrypt = require('bcrypt');
    otpRecord.otpHash = await bcrypt.hash('123456', 10);
    await otpRecord.save();

    const res = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({
        token,
        otp: '123456',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.otpToken).toBeDefined();

    otpToken = res.body.data.otpToken;
  });

  it('should set password successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/set-password')
      .send({
        otpToken,
        password: 'Pass@123password',
      })
      .expect(200);

    expect(res.body.success).toBe(true);
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
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();

    accessToken = res.body.data.token;
    refreshToken = res.body.data.refreshToken;
  });

  it('should retrieve logged in user profile via /me', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.mobile).toBe(testMobile);
  });

  it('should logout user and revoke refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .send({ refreshToken })
      .expect(200);

    expect(res.body.success).toBe(true);
  });
});