const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { addMemberSchema } = require('../validators/member.validator');

router.post('/:mandalId', authMiddleware, roleMiddleware('admin'), validate(addMemberSchema), memberController.add);
router.get('/:mandalId', authMiddleware, memberController.list);
router.delete('/:mandalId/:userId', authMiddleware, roleMiddleware('admin'), memberController.remove);

module.exports = router;