const { AuditLog } = require('../infrastructure/database/models');
const logger = require('./logger');

/**
 * Record an audit log entry in the database.
 * This runs in a non-blocking try-catch so it won't crash the main API execution.
 */
const recordAuditLog = async ({ userId, action, details, ipAddress, result }) => {
  try {
    const detailString = details && typeof details === 'object' ? JSON.stringify(details) : details || '';
    
    await AuditLog.create({
      userId: userId || null,
      action,
      details: detailString,
      ipAddress: ipAddress || null,
      result: result || 'SUCCESS',
    });
    
    logger.info(`Audit Log recorded: ${action} - Result: ${result}`, { userId, ipAddress });
  } catch (error) {
    logger.error(`Failed to write Audit Log for ${action}: ${error.message}`, { error: error.stack });
  }
};

module.exports = { recordAuditLog };
