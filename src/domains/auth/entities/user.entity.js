class User {
  constructor({ id, name, email, mobile, password, verified }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.mobile = mobile;
    this.password = password;
    this.verified = verified;
  }
}

module.exports = User;