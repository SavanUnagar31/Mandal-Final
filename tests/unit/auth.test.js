// tests/unit/auth.test.js
require('dotenv').config();
const authService = require('../../src/domains/auth/services/auth.service');
const userRepo = require('../../src/domains/auth/repositories/user.repository');
const { UserRole, UserOtp, UserSession } = require('../../src/infrastructure/database/models');
const { sendSMS } = require('../../src/infrastructure/external/notification.provider');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../../src/domains/auth/repositories/user.repository');
jest.mock('../../src/infrastructure/database/models', () => ({
  UserRole: {
    create: jest.fn(),
    findAll: jest.fn(),
  },
  UserOtp: {
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
  },
  UserSession: {
    create: jest.fn(),
    findByPk: jest.fn(),
  },
}));
jest.mock('../../src/infrastructure/external/notification.provider', () => ({
  sendSMS: jest.fn().mockResolvedValue(true),
}));
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_value'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('Auth Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkMobile', () => {
    it('should throw 404 if user not found', async () => {
      userRepo.findByMobile.mockResolvedValue(null);
      await expect(authService.checkMobile('1234567890')).rejects.toMatchObject({
        statusCode: 404,
        errorCode: 'USER_NOT_FOUND',
      });
    });

    it('should return isPasswordSet true if user has password set', async () => {
      userRepo.findByMobile.mockResolvedValue({ mobile: '1234567890', isPasswordSet: true });
      const res = await authService.checkMobile('1234567890');
      expect(res.isPasswordSet).toBe(true);
    });

    it('should return token and isPasswordSet false if user does not have password set', async () => {
      userRepo.findByMobile.mockResolvedValue({ id: 'user_uuid', mobile: '1234567890', isPasswordSet: false });
      UserOtp.create.mockResolvedValue({});
      const res = await authService.checkMobile('1234567890');
      expect(res.isPasswordSet).toBe(false);
      expect(res.token).toBeDefined();
    });
  });

  describe('register', () => {
    it('should register a new user and return token details', async () => {
      // For uniqueness check findByMobile returns null, but for sendOtp it must return the created user!
      // So we mock findByMobile to return null on first call, and the created user on subsequent calls.
      userRepo.findByMobile
        .mockResolvedValueOnce(null) // uniqueness check
        .mockResolvedValueOnce({ id: 'user_uuid', mobile: '9999999999' }); // sendOtp check
      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.create.mockResolvedValue({ id: 'user_uuid', mobile: '9999999999', name: 'Test' });
      UserRole.create.mockResolvedValue({});
      UserOtp.create.mockResolvedValue({});

      const res = await authService.register({
        name: 'Test',
        mobile: '9999999999',
        email: 'test@example.com',
      });

      expect(res.token).toBeDefined();
      expect(userRepo.create).toHaveBeenCalled();
      expect(UserRole.create).toHaveBeenCalledWith({ userId: 'user_uuid', role: 'MANDAL_OWNER' });
      expect(sendSMS).toHaveBeenCalled();
    });

    it('should throw 409 if mobile is already registered', async () => {
      userRepo.findByMobile.mockResolvedValue({ id: 'existing' });
      await expect(authService.register({ name: 'Test', mobile: '9999999999' })).rejects.toMatchObject({
        statusCode: 409,
        errorCode: 'MOBILE_ALREADY_EXISTS',
      });
    });
  });
});