const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loan.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { requestLoanSchema, approveLoanSchema } = require('../validators/loan.validator');

router.post('/:mandalId/request', authMiddleware, roleMiddleware('member'), validate(requestLoanSchema), loanController.requestLoan);
router.put('/:loanId/approve', authMiddleware, roleMiddleware('admin'), validate(approveLoanSchema), loanController.approveLoan);
router.post('/:loanId/repay', authMiddleware, roleMiddleware('member'), validate(requestLoanSchema), loanController.repay);
router.get('/:mandalId', authMiddleware, roleMiddleware('member'), loanController.list);

module.exports = router;