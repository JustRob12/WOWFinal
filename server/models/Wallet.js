const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const walletSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true,
    // This field will store the tokenized account number
    // Format: TOK_[encrypted]_[last4digits]
  },
  transactions: [transactionSchema],
}, {
  timestamps: true,
});

// Add index for faster queries
walletSchema.index({ userId: 1 });

module.exports = mongoose.model('Wallet', walletSchema); 