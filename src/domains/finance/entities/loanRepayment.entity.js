class LoanRepayment {
  constructor({ id, loanId, amount, date, type }) {
    this.id = id;
    this.loanId = loanId;
    this.amount = amount;
    this.date = date;
    this.type = type;
  }
}

module.exports = LoanRepayment;