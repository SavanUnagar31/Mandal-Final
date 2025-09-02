const express = require('express');
const router = express.Router();
const contributionController = require('../controllers/contribution.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { payContributionSchema } = require('../validators/contribution.validator');

router.post('/:mandalId/pay', authMiddleware, roleMiddleware('member'), validate(payContributionSchema), contributionController.pay);
router.get('/:mandalId', authMiddleware, roleMiddleware('member'), contributionController.list);

module.exports = router;