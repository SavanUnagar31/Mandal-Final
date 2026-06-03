jest.mock('../../src/domains/mandal/repositories/mandal.repository');
jest.mock('../../src/domains/mandal/repositories/mandalMember.repository');

const mandalService = require('../../src/domains/mandal/services/mandal.service');
const mandalRepo = require('../../src/domains/mandal/repositories/mandal.repository');
const mandalMemberRepo = require('../../src/domains/mandal/repositories/mandalMember.repository');

describe('Mandal Service', () => {
  it('should create a mandal', async () => {
    mandalRepo.create.mockResolvedValue({ id: 1, name: 'Test Mandal' });
    mandalMemberRepo.create.mockResolvedValue({ mandalId: 1, userId: 1, role: 'admin' });

    const result = await mandalService.create({ name: 'Test Mandal' }, 1);
    expect(result).toBeDefined();
    expect(mandalRepo.create).toHaveBeenCalled();
    expect(mandalMemberRepo.create).toHaveBeenCalledWith({ mandalId: 1, userId: 1, role: 'admin' });
  });
});