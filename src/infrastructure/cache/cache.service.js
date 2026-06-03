const { client } = require("./redis.config");
const logger = require("../../utils/logger");

const USE_REDIS = process.env.USE_REDIS === "true" && process.env.NODE_ENV !== "test";
const DEFAULT_TTL = 3600; // 1 hour in seconds

// Helper to safely check if redis client is open and ready to use
const isCacheReady = () => {
  return USE_REDIS && client && client.isOpen;
};

const get = async (key) => {
  if (!isCacheReady()) return null;
  try {
    const value = await client.get(key);
    if (!value) return null;
    return JSON.parse(value);
  } catch (error) {
    logger.warn(`Cache read error for key ${key}: ${error.message}`);
    return null;
  }
};

const set = async (key, value, ttl = DEFAULT_TTL) => {
  if (!isCacheReady()) return false;
  try {
    const serialized = JSON.stringify(value);
    await client.set(key, serialized, { EX: ttl });
    return true;
  } catch (error) {
    logger.warn(`Cache write error for key ${key}: ${error.message}`);
    return false;
  }
};

const del = async (key) => {
  if (!isCacheReady()) return false;
  try {
    await client.del(key);
    return true;
  } catch (error) {
    logger.warn(`Cache delete error for key ${key}: ${error.message}`);
    return false;
  }
};

// Application cache keys
const getUserKey = (id) => `cache:user:id:${id}`;
const getUserByMobileKey = (mobile) => `cache:user:mobile:${mobile}`;
const getUserByEmailKey = (email) => `cache:user:email:${email}`;
const getUserRolesKey = (userId) => `cache:user:roles:${userId}`;

const getMandalKey = (id) => `cache:mandal:id:${id}`;
const getMandalByNameKey = (name) => `cache:mandal:name:${name}`;

const getMandalMemberRoleKey = (userId, mandalId) => `cache:mandal_member:role:${userId}:${mandalId}`;
const getMandalMemberRelationKey = (userId, mandalId) => `cache:mandal_member:relation:${userId}:${mandalId}`;

module.exports = {
  get,
  set,
  del,
  
  // User cache
  getUser: async (id) => get(getUserKey(id)),
  setUser: async (id, user) => {
    if (!user) return;
    await set(getUserKey(id), user);
    if (user.mobile) await set(getUserByMobileKey(user.mobile), user);
    if (user.email) await set(getUserByEmailKey(user.email), user);
  },
  getUserByMobile: async (mobile) => get(getUserByMobileKey(mobile)),
  getUserByEmail: async (email) => get(getUserByEmailKey(email)),
  invalidateUser: async (user) => {
    if (!user) return;
    const id = typeof user === "object" ? user.id : user;
    await del(getUserKey(id));
    if (typeof user === "object") {
      if (user.mobile) await del(getUserByMobileKey(user.mobile));
      if (user.email) await del(getUserByEmailKey(user.email));
    }
  },

  // User Roles cache
  getUserRoles: async (userId) => get(getUserRolesKey(userId)),
  setUserRoles: async (userId, roles) => set(getUserRolesKey(userId), roles),
  invalidateUserRoles: async (userId) => del(getUserRolesKey(userId)),

  // Mandal cache
  getMandal: async (id) => get(getMandalKey(id)),
  setMandal: async (id, mandal) => {
    if (!mandal) return;
    await set(getMandalKey(id), mandal);
    if (mandal.name) await set(getMandalByNameKey(mandal.name), mandal);
  },
  getMandalByName: async (name) => get(getMandalByNameKey(name)),
  invalidateMandal: async (mandal) => {
    if (!mandal) return;
    const id = typeof mandal === "object" ? mandal.id : mandal;
    await del(getMandalKey(id));
    if (typeof mandal === "object" && mandal.name) {
      await del(getMandalByNameKey(mandal.name));
    }
  },

  // Mandal Member role/relation cache
  getMandalMemberRole: async (userId, mandalId) => {
    if (!isCacheReady()) return null;
    try {
      return await client.get(getMandalMemberRoleKey(userId, mandalId));
    } catch (error) {
      logger.warn(`Cache read error for member role: ${error.message}`);
      return null;
    }
  },
  setMandalMemberRole: async (userId, mandalId, role) => {
    if (!isCacheReady() || role === undefined) return false;
    try {
      await client.set(getMandalMemberRoleKey(userId, mandalId), role || "", { EX: DEFAULT_TTL });
      return true;
    } catch (error) {
      logger.warn(`Cache write error for member role: ${error.message}`);
      return false;
    }
  },
  getMandalMemberRelation: async (userId, mandalId) => get(getMandalMemberRelationKey(userId, mandalId)),
  setMandalMemberRelation: async (userId, mandalId, relation) => set(getMandalMemberRelationKey(userId, mandalId), relation),
  invalidateMandalMember: async (userId, mandalId) => {
    await del(getMandalMemberRoleKey(userId, mandalId));
    await del(getMandalMemberRelationKey(userId, mandalId));
  }
};
