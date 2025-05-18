const express = require('express');
const router = express.Router();
const {
  createWallet,
  getWallets,
  getWalletById,
  updateWallet,
  deleteWallet,
  addTransaction,
  getTransactionsSummary
} = require('../controllers/walletController');
const auth = require('../middleware/auth');

// All wallet routes are protected
router.use(auth);

// Wallet routes
router.post('/', createWallet);
router.get('/user/:userId', getWallets);
router.get('/:id', getWalletById);
router.put('/:id', updateWallet);
router.delete('/:id', deleteWallet);

// Transaction routes
router.post('/:id/transactions', addTransaction);
router.get('/:id/transactions', getTransactionsSummary);

module.exports = router; 