const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  passwordLastChanged: {
    type: Date,
    required: true,
    default: Date.now
  },
  lastLogout: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  displayName: String,
  photoURL: String,
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Add indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ uid: 1 });

// Virtual for password age
userSchema.virtual('passwordAge').get(function() {
  return new Date() - this.passwordLastChanged;
});

// Method to check if password needs to be changed
userSchema.methods.needsPasswordChange = function() {
  const passwordExpirationPeriod = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
  return this.passwordAge > passwordExpirationPeriod;
};

// Method to update password change date
userSchema.methods.updatePasswordChangeDate = async function() {
  this.passwordLastChanged = new Date();
  await this.save();
};

// Generate auth token
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString(), email: user.email },
    process.env.JWT_SECRET
  );

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 