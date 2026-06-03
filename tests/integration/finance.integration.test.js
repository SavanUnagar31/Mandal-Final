jest.mock('../../src/domains/finance/services/payment.service', () => ({
  createOrder: jest.fn().mockResolvedValue({ id: 'order_mock_123' }),
}));

const request = require('supertest');
const app = require('../../server');
const { sequelize, User, UserRole, Mandal, MandalMember } = require('../../src/infrastructure/database/models');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../src/config/environment.config');

describe('Finance API', () => {
  let token;
  let mandalId;

  beforeAll(async () => {
    // DB is synced by tests/setup.js
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    mandalId = '123e4567-e89b-12d3-a456-426614174001';

    // Create user
    await User.create({
      id: userId,
      name: 'Finance User',
      mobile: '6666666666',
      status: 'ACTIVE',
      is_mobile_verified: true,
      is_password_set: true
    });

    // Create role
    await UserRole.create({
      userId: userId,
      role: 'MEMBER'
    });

    // Create mandal
    await Mandal.create({
      id: mandalId,
      name: 'Finance Mandal',
      creatorUserId: userId,
      contributionMode: 'monthly',
      contributionAmount: 1000,
      interestRate: 5
    });

    // Create member relationship
    await MandalMember.create({
      id: '123e4567-e89b-12d3-a456-426614174002',
      mandalId,
      userId,
      role: 'member'
    });

    token = jwt.sign({ id: userId }, jwtSecret);
  });

  it('should process contribution payment', async () => {
    const res = await request(app)
      .post(`/api/v1/contributions/${mandalId}/pay`)
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 1000 })
      .expect(200);
    expect(res.body.success).toBe(true);
  }, 10000);
});