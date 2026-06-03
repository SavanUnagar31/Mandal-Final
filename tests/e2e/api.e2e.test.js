// tests/e2e/api.e2e.test.js
const request = require('supertest');
const app = require('../../server');
const { User, UserOtp } = require('../../src/infrastructure/database/models');
const bcrypt = require('bcrypt');

jest.mock('../../src/infrastructure/external/notification.provider', () => ({
  sendSMS: jest.fn().mockResolvedValue(true),
}));

describe('E2E API Auth Flow', () => {
  const testMobile = '7777777777';
  const testEmail = 'e2e@mandal.com';

  beforeAll(async () => {
    await User.destroy({ where: { mobile: testMobile } });
    await UserOtp.destroy({ where: { mobile: testMobile } });
  });

  it('should complete registration, otp verify, set password, and login', async () => {
    // 1. Register
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'E2E User',
        mobile: testMobile,
        email: testEmail,
        address: 'E2E City',
      })
      .expect(201);

    const { otpRef } = regRes.body.data;

    // 2. Fetch OTP and update hash in DB for test verification
    const otpRecord = await UserOtp.findOne({ where: { id: otpRef } });
    expect(otpRecord).toBeDefined();
    otpRecord.otpHash = await bcrypt.hash('123456', 10);
    await otpRecord.save();

    // 3. Verify OTP
    const verifyRes = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({
        mobile: testMobile,
        otp: '123456',
        purpose: 'register',
        otpRef,
      })
      .expect(200);

    const { otpToken } = verifyRes.body.data;

    // 4. Set Password
    await request(app)
      .post('/api/v1/auth/set-password')
      .send({
        mobile: testMobile,
        otpToken,
        password: 'Pass@123password',
        confirmPassword: 'Pass@123password',
      })
      .expect(200);

    // 5. Login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        mobile: testMobile,
        password: 'Pass@123password',
      })
      .expect(200);

    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.accessToken).toBeDefined();
  }, 15000);
});