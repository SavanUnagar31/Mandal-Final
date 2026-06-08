const userRepo = require('../repositories/user.repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const { jwtSecret } = require('../../../config/environment.config');
const { UserRole, UserOtp, UserSession } = require('../../../infrastructure/database/models');
const AppError = require('../../../utils/error');
const cacheService = require('../../../infrastructure/cache/cache.service');
const logger = require('../../../utils/logger');
const { sendSMS } = require('../../../infrastructure/external/notification.provider');

// Generate 6-digit OTP
const generateVerificationCode = () => {
  if (process.env.NODE_ENV === 'localhost') {
    return '123456';
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const checkMobile = async (mobile) => {
  try {
    const user = await userRepo.findByMobile(mobile);
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    const isPasswordSet = user.isPasswordSet;
    if (isPasswordSet) {
      return {
        mobile: user.mobile,
        isPasswordSet: true,
      };
    }

    // If password is not set, automatically send OTP and return token
    const otpData = await sendOtp(mobile);
    return {
      mobile: user.mobile,
      isPasswordSet: false,
      token: otpData.token,
    };
  } catch (error) {
    logger.error('Error in checkMobile service', { mobile, error: error.message });
    throw error;
  }
};

const sendOtp = async (mobile) => {
  try {
    const user = await userRepo.findByMobile(mobile);
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    const otp = generateVerificationCode();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpRef = randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await UserOtp.create({
      id: otpRef,
      mobile,
      userId: user.id,
      otpHash,
      purpose: 'LOGIN',
      expiresAt,
      attemptCount: 0,
    });

    // Queue SMS notification
    if (process.env.NODE_ENV !== 'localhost') {
      await sendSMS(mobile, `Your Mandal verification OTP is ${otp}. Expiry: 5 mins.`);
    }
    logger.info(`SMS OTP generated for ${mobile}: ${otp} (Ref: ${otpRef})`);

    const token = jwt.sign({ mobile, otpRef }, jwtSecret, { expiresIn: '5m' });
    return {
      token,
    };
  } catch (error) {
    logger.error('Error in sendOtp service', { mobile, error: error.message });
    throw error;
  }
};

const verifyOtp = async (token, otp) => {
  try {
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      throw new AppError(400, 'Invalid or expired OTP token', 'INVALID_TOKEN');
    }

    const { mobile, otpRef } = decoded;

    let record = await UserOtp.findOne({
      where: { id: otpRef, mobile }
    });

    if (!record && process.env.NODE_ENV === 'localhost') {
      // Fallback to latest record for this mobile
      record = await UserOtp.findOne({
        where: { mobile },
        order: [['createdAt', 'DESC']],
      });

      // If still no record exists, create one on the fly
      if (!record) {
        const user = await userRepo.findByMobile(mobile, true);
        const otpHash = await bcrypt.hash('123456', 10);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        record = await UserOtp.create({
          id: otpRef || randomUUID(),
          mobile,
          userId: user ? user.id : null,
          otpHash,
          purpose: 'LOGIN',
          expiresAt,
          attemptCount: 0,
        });
      }
    }

    if (!record) {
      throw new AppError(400, 'Invalid OTP', 'INVALID_OTP');
    }

    if (record.verifiedAt) {
      throw new AppError(400, 'OTP already verified', 'INVALID_OTP');
    }

    if (new Date() > record.expiresAt) {
      throw new AppError(400, 'OTP expired', 'OTP_EXPIRED');
    }

    if (record.attemptCount >= 5) {
      throw new AppError(429, 'Too many attempts. Please resend OTP.', 'OTP_ATTEMPT_LIMIT');
    }

    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) {
      record.attemptCount += 1;
      await record.save();

      if (record.attemptCount >= 5) {
        throw new AppError(429, 'Too many attempts. Please resend OTP.', 'OTP_ATTEMPT_LIMIT');
      }
      throw new AppError(400, 'Invalid OTP', 'INVALID_OTP');
    }

    // Mark as verified
    record.verifiedAt = new Date();
    await record.save();

    // Create 10m short-lived token
    const otpToken = jwt.sign(
      { mobile, otpRef: record.id },
      jwtSecret,
      { expiresIn: '10m' }
    );

    return {
      otpToken,
    };
  } catch (error) {
    logger.error('Error in verifyOtp service', { error: error.message });
    throw error;
  }
};

const setPassword = async (otpToken, password) => {
  try {
    let decoded;
    try {
      decoded = jwt.verify(otpToken, jwtSecret);
    } catch (err) {
      throw new AppError(400, 'Invalid or expired OTP token', 'INVALID_TOKEN');
    }

    const { mobile, otpRef } = decoded;

    // Double check OTP ref was verified
    const otpRec = await UserOtp.findByPk(otpRef);
    if (!otpRec || !otpRec.verifiedAt || otpRec.mobile !== mobile) {
      throw new AppError(400, 'OTP verification required', 'INVALID_OTP');
    }

    const user = await userRepo.findByMobile(mobile);
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await userRepo.update(user.id, {
      passwordHash,
      isPasswordSet: true,
      isMobileVerified: true, // Mark verified when password is set successfully via verified OTP
    });

    return true;
  } catch (error) {
    logger.error('Error in setPassword service', { error: error.message });
    throw error;
  }
};

const login = async (mobile, password) => {
  try {
    // For login, we bypass the cache to get the fresh record with the password hash
    const user = await userRepo.findByMobile(mobile, true);
    if (!user || !user.isPasswordSet || !user.passwordHash) {
      throw new AppError(401, 'Invalid mobile or password', 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError(401, 'Invalid mobile or password', 'INVALID_CREDENTIALS');
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError(403, 'User is inactive or blocked', 'USER_INACTIVE');
    }

    if (!user.isMobileVerified) {
      throw new AppError(403, 'Mobile not verified', 'USER_UNVERIFIED');
    }

    // Load roles from cache/DB
    let roles = await cacheService.getUserRoles(user.id);
    if (!roles) {
      const userRoles = await UserRole.findAll({ where: { userId: user.id } });
      roles = userRoles.map(ur => ur.role);
      await cacheService.setUserRoles(user.id, roles);
    }

    // Tokens - Access token shortened to 15 minutes
    const accessToken = jwt.sign(
      { id: user.id, mobile: user.mobile, roles },
      jwtSecret,
      { expiresIn: '15m' }
    );

    const sessionId = randomUUID();
    const refreshToken = jwt.sign(
      { sessionId },
      jwtSecret,
      { expiresIn: '30d' }
    );
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

    await UserSession.create({
      id: sessionId,
      userId: user.id,
      refreshTokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return {
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
      },
    };
  } catch (error) {
    logger.error('Login failed', { mobile, error: error.message });
    throw error;
  }
};

const register = async ({ name, mobile, email, address, latitude, longitude }) => {
  try {
    // Uniqueness validation
    const existingMobile = await userRepo.findByMobile(mobile);
    if (existingMobile) {
      throw new AppError(409, 'Mobile number already registered', 'MOBILE_ALREADY_EXISTS');
    }

    if (email) {
      const existingEmail = await userRepo.findByEmail(email);
      if (existingEmail) {
        throw new AppError(409, 'Email already registered', 'EMAIL_ALREADY_EXISTS');
      }
    }

    // Create user
    const user = await userRepo.create({
      name,
      mobile,
      email,
      address,
      latitude,
      longitude,
    });

    // Default role
    await UserRole.create({
      userId: user.id,
      role: 'MANDAL_OWNER',
    });
    await cacheService.invalidateUserRoles(user.id);

    // Send OTP
    const otpData = await sendOtp(mobile);

    return {
      token: otpData.token,
      userId: user.id,
    };
  } catch (error) {
    logger.error('Registration failed', { mobile, error: error.message });
    throw error;
  }
};

const me = async (userId) => {
  try {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    return {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      mandals: [],
    };
  } catch (error) {
    logger.error('Me profile fetch failed', { userId, error: error.message });
    throw error;
  }
};

const logout = async (refreshToken) => {
  try {
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, jwtSecret);
    } catch (err) {
      throw new AppError(400, 'Invalid refresh token', 'INVALID_TOKEN');
    }

    const session = await UserSession.findByPk(decoded.sessionId);
    let userId = null;
    if (session) {
      userId = session.userId;
      session.revokedAt = new Date();
      await session.save();
    }

    return {
      success: true,
      message: 'Logout successful',
      userId,
    };
  } catch (error) {
    logger.error('Logout failed', { error: error.message });
    throw error;
  }
};

const refresh = async (refreshToken) => {
  try {
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, jwtSecret);
    } catch (err) {
      throw new AppError(401, 'Invalid refresh token', 'INVALID_TOKEN');
    }

    const session = await UserSession.findOne({
      where: { id: decoded.sessionId }
    });

    if (!session) {
      throw new AppError(401, 'Session not found', 'SESSION_NOT_FOUND');
    }

    if (session.revokedAt) {
      throw new AppError(401, 'Session has been revoked', 'SESSION_REVOKED');
    }

    if (new Date() > session.expiresAt) {
      throw new AppError(401, 'Session has expired', 'SESSION_EXPIRED');
    }

    const isMatch = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if (!isMatch) {
      session.revokedAt = new Date();
      await session.save();
      logger.warn(`Potential replay attack: refresh token hash mismatch. Revoked session: ${session.id}`);
      throw new AppError(401, 'Session revoked due to reuse detection', 'SESSION_REVOKED');
    }

    const user = await userRepo.findById(session.userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new AppError(403, 'User is inactive or not found', 'USER_INACTIVE');
    }

    let roles = await cacheService.getUserRoles(user.id);
    if (!roles) {
      const userRoles = await UserRole.findAll({ where: { userId: user.id } });
      roles = userRoles.map(ur => ur.role);
      await cacheService.setUserRoles(user.id, roles);
    }

    const accessToken = jwt.sign(
      { id: user.id, mobile: user.mobile, roles },
      jwtSecret,
      { expiresIn: '15m' }
    );

    const newSessionId = randomUUID();
    const newRefreshToken = jwt.sign(
      { sessionId: newSessionId },
      jwtSecret,
      { expiresIn: '30d' }
    );
    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 12);

    session.revokedAt = new Date();
    await session.save();

    await UserSession.create({
      id: newSessionId,
      userId: user.id,
      refreshTokenHash: newRefreshTokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return {
      token: accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
      },
    };
  } catch (error) {
    logger.error('Token refresh failed', { error: error.message });
    throw error;
  }
};

module.exports = {
  checkMobile,
  sendOtp,
  verifyOtp,
  setPassword,
  login,
  register,
  me,
  logout,
  refresh,
};