class Contribution {
  constructor({ id, mandalId, userId, amountPaid, dueDate, paidDate, status }) {
    this.id = id;
    this.mandalId = mandalId;
    this.userId = userId;
    this.amountPaid = amountPaid;
    this.dueDate = dueDate;
    this.paidDate = paidDate;
    this.status = status;
  }
}

module.exports = Contribution;