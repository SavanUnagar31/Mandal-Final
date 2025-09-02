const loanService = require('../../src/domains/finance/services/loan.service');
const mandalRepo = require('../../src/domains/mandal/repositories/mandal.repository');
const loanRepo = require('../../src/domains/finance/repositories/loan.repository');
jest.mock('../../src/domains/mandal/repositories/mandal.repository');
jest.mock('../../src/domains/finance/repositories/loan.repository');

describe('Loan Service', () => {
  it('should request a loan', async () => {
    mandalRepo.findById.mockResolvedValue({ id: 1 });
    loanRepo.create.mockResolvedValue({ id: 1, mandalId: 1, userId: 1, amount: 1000, status: 'requested' });

    const result = await loanService.requestLoan(1, 1, 1000);
    expect(result).toBeDefined();
    expect(mandalRepo.findById).toHaveBeenCalledWith(1);
    expect(loanRepo.create).toHaveBeenCalledWith({ mandalId: 1, userId: 1, amount: 1000, status: 'requested' });
  });
});