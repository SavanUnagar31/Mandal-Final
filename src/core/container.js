const { Container } = require('inversify');
const container = new Container();

container.bind('UserRepository').toConstant(require('../domains/auth/repositories/user.repository'));
container.bind('MandalRepository').toConstant(require('../domains/mandal/repositories/mandal.repository'));
container.bind('MandalMemberRepository').toConstant(require('../domains/mandal/repositories/mandalMember.repository'));
container.bind('ContributionRepository').toConstant(require('../domains/finance/repositories/contribution.repository'));
container.bind('LoanRepository').toConstant(require('../domains/finance/repositories/loan.repository'));
container.bind('LoanRepaymentRepository').toConstant(require('../domains/finance/repositories/loanRepayment.repository'));

module.exports = container;