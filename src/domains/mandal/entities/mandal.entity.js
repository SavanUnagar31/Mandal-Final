class Mandal {
  constructor({ id, name, creatorUserId, contributionMode, contributionAmount, interestRate }) {
    this.id = id;
    this.name = name;
    this.creatorUserId = creatorUserId;
    this.contributionMode = contributionMode;
    this.contributionAmount = contributionAmount;
    this.interestRate = interestRate;
  }
}

module.exports = Mandal;