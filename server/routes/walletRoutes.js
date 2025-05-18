const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const walletController = require('../controllers/walletController');

// Create a new wallet
router.post('/', auth, walletController.createWallet);

// Get all wallets for a user
router.get('/user/:userId', auth, walletController.getWalletsByUser);

// Get a specific wallet
router.get('/:id', auth, walletController.getWallet);

// Update a wallet
router.put('/:id', auth, walletController.updateWallet);

// Delete a wallet
router.delete('/:id', auth, walletController.deleteWallet);

// Add a transaction to a wallet
router.post('/:id/transactions', auth, walletController.addTransaction);

// Get transactions for a specific period
router.get('/:id/transactions', auth, walletController.getTransactions);

// Get transactions summary
router.get('/:id/transactions/summary', auth, walletController.getTransactionsSummary);

module.exports = router; 