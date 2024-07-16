const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: String,
  username: String,
  token: String,
  hash: String,
  salt: String,
  avatar: Object,
});

module.exports = User;
