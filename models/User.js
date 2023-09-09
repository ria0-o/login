const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  resetPasswordToken: String,         // Field for reset token
  resetPasswordTokenExpiration: Date, // Field for token expiration timestamp
});

const User = mongoose.model('User', userSchema);

module.exports = User;


