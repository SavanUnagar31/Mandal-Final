const express = require('express');
const router = express.Router();
const mandalController = require('../controllers/mandal.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { createMandalSchema, updateMandalSchema } = require('../validators/mandal.validator');

router.post('/', authMiddleware, validate(createMandalSchema), mandalController.create);
router.get('/', authMiddleware, mandalController.getAll);
router.get('/:id', authMiddleware, roleMiddleware('member'), mandalController.get);
router.put('/:id', authMiddleware, roleMiddleware('admin'), validate(updateMandalSchema), mandalController.update);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), mandalController.deleteMandal);

module.exports = router;