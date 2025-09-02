class Loan {
  constructor({ id, mandalId, userId, amount, interestRate, durationMonths, startDate, endDate, totalPayable, repaidAmount, status }) {
    this.id = id;
    this.mandalId = mandalId;
    this.userId = userId;
    this.amount = amount;
    this.interestRate = interestRate;
    this.durationMonths = durationMonths;
    this.startDate = startDate;
    this.endDate = endDate;
    this.totalPayable = totalPayable;
    this.repaidAmount = repaidAmount;
    this.status = status;
  }
}

module.exports = Loan;