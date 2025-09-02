const express = require('express');
const router = express.Router();

// Import individual route modules directly
const authRoutes = require('./auth.routes');
const mandalRoutes = require('./mandal.routes');
const memberRoutes = require('./member.routes');
const contributionRoutes = require('./contribution.routes');
const loanRoutes = require('./loan.routes');

// Mount the routes
router.use('/auth', authRoutes);
router.use('/mandals', mandalRoutes);
router.use('/members', memberRoutes);
router.use('/contributions', contributionRoutes);
router.use('/loans', loanRoutes);

module.exports = router;