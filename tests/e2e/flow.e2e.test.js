const request = require('supertest');
const app = require('../../server'); // Updated path
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../src/config/environment.config');

describe('E2E Flow', () => {
  it('should complete user flow', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test', email: 'test@example.com', mobile: '1234567890', password: 'password' })
      .expect(201);
    const token = jwt.sign({ id: 1 }, jwtSecret);
    await request(app)
      .post('/api/v1/mandals')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Mandal', contributionMode: 'monthly', contributionAmount: 1000, interestRate: 5 })
      .expect(201);
  }, 10000);
});