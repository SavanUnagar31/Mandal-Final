require('dotenv').config();
const { User, UserRole, UserSession, UserOtp, MandalMember } = require('../src/infrastructure/database/models');
const { connectDB } = require('../src/config/database.config');
const { connect: connectRedis, disconnect: disconnectRedis } = require('../src/infrastructure/cache/redis.config');
const cacheService = require('../src/infrastructure/cache/cache.service');

const mobile = process.argv[2];
const email = process.argv[3];

if (!mobile) {
  console.error('Please provide a mobile number: node scripts/delete-user.js <mobile> [email]');
  process.exit(1);
}

(async () => {
  try {
    await connectDB();
    await connectRedis();

    const user = await User.findOne({ where: { mobile } });
    if (!user) {
      console.log(`User with mobile ${mobile} not found in DB. Cleaning up any leftover cache...`);
      const cachedUser = await cacheService.getUserByMobile(mobile);
      if (cachedUser) {
        console.log(`Found cached user. Invalidating cache for id: ${cachedUser.id}, email: ${cachedUser.email}...`);
        await cacheService.invalidateUser(cachedUser);
        await cacheService.invalidateUserRoles(cachedUser.id);
      } else {
        await cacheService.invalidateUser({ mobile });
      }
      
      if (email) {
        console.log(`Manually invalidating cache for email: ${email}...`);
        await cacheService.invalidateUser({ email });
      }

      await disconnectRedis();
      process.exit(0);
    }

    console.log(`Deleting user ${user.name} (${mobile}) and associated data...`);

    // Delete associated data
    await UserRole.destroy({ where: { userId: user.id } });
    await UserSession.destroy({ where: { userId: user.id } });
    await UserOtp.destroy({ where: { userId: user.id } });
    await MandalMember.destroy({ where: { userId: user.id } });
    
    // Also delete any orphan OTPs for this mobile
    await UserOtp.destroy({ where: { mobile } });

    // Delete user
    await user.destroy();

    // Invalidate Cache
    await cacheService.invalidateUser(user);
    await cacheService.invalidateUserRoles(user.id);

    if (email) {
      console.log(`Manually invalidating cache for email: ${email}...`);
      await cacheService.invalidateUser({ email });
    }

    await disconnectRedis();
    console.log('User deleted successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to delete user:', error);
    try {
      await disconnectRedis();
    } catch (_) {}
    process.exit(1);
  }
})();
