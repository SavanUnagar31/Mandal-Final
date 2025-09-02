const contributionService = require('../../src/domains/finance/services/contribution.service');
const paymentService = require('../../src/domains/finance/services/payment.service');
const mandalRepo = require('../../src/domains/mandal/repositories/mandal.repository');
const mandalMemberRepo = require('../../src/domains/mandal/repositories/mandalMember.repository');
const contributionRepo = require('../../src/domains/finance/repositories/contribution.repository');
jest.mock('../../src/domains/mandal/repositories/mandal.repository');
jest.mock('../../src/domains/mandal/repositories/mandalMember.repository');
jest.mock('../../src/domains/finance/services/payment.service');
jest.mock('../../src/domains/finance/repositories/contribution.repository');

describe('Contribution Service', () => {
  it('should process payment', async () => {
    mandalRepo.findById.mockResolvedValue({ id: 1, contributionAmount: 1000 });
    mandalMemberRepo.findByUserAndMandal.mockResolvedValue({ mandalId: 1, userId: 1 });
    paymentService.createOrder.mockResolvedValue({ id: 'order_123' });
    contributionRepo.create.mockResolvedValue({ id: 1, mandalId: 1, userId: 1, amount: 1000 });

    const result = await contributionService.pay(1, 1, 1000);
    expect(result).toBeDefined();
    expect(mandalRepo.findById).toHaveBeenCalledWith(1);
    expect(mandalMemberRepo.findByUserAndMandal).toHaveBeenCalledWith(1, 1);
  });
});