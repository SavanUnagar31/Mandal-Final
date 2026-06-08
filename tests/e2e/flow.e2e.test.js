const request = require('supertest');
const app = require('../../server');
const { User, UserOtp } = require('../../src/infrastructure/database/models');
const bcrypt = require('bcrypt');

describe('E2E Flow', () => {
  const testMobile = '9999999999';

  beforeAll(async () => {
    await User.destroy({ where: { mobile: testMobile } });
    await UserOtp.destroy({ where: { mobile: testMobile } });
  });

  it('should complete full user registration, password setup, login, and mandal creation flow', async () => {
    // 1. Register User
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Flow Test User',
        mobile: testMobile,
        email: 'flow@example.com',
        address: 'Flow City'
      })
      .expect(201);

    expect(regRes.body.success).toBe(true);
    const token = regRes.body.data.token;
    expect(token).toBeDefined();

    // 2. Fetch and rewrite OTP hash in DB
    const otpRecord = await UserOtp.findOne({ where: { mobile: testMobile }, order: [['createdAt', 'DESC']] });
    expect(otpRecord).toBeDefined();
    const otpRef = otpRecord.id;
    otpRecord.otpHash = await bcrypt.hash('123456', 10);
    await otpRecord.save();

    // 3. Verify OTP
    const verifyRes = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({
        token,
        otp: '123456'
      })
      .expect(200);

    expect(verifyRes.body.success).toBe(true);
    const otpToken = verifyRes.body.data.otpToken;
    expect(otpToken).toBeDefined();

    // 4. Set Password
    const setPassRes = await request(app)
      .post('/api/v1/auth/set-password')
      .send({
        otpToken,
        password: 'Password@123'
      })
      .expect(200);

    expect(setPassRes.body.success).toBe(true);

    // 5. Login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        mobile: testMobile,
        password: 'Password@123'
      })
      .expect(200);

    expect(loginRes.body.success).toBe(true);
    const accessToken = loginRes.body.data.token;
    expect(accessToken).toBeDefined();

    // 6. Create Mandal
    const mandalRes = await request(app)
      .post('/api/v1/mandals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Flow Test Mandal',
        contributionMode: 'monthly',
        contributionAmount: 1000,
        interestRate: 5
      })
      .expect(201);

    expect(mandalRes.body.success).toBe(true);
    expect(mandalRes.body.data.mandalId).toBeDefined();
  }, 60000);
});