const Wallet = require('../models/Wallet');

const walletController = {
  // Create a new wallet
  createWallet: async (req, res) => {
    try {
      const { name, currency, accountNumber, userId } = req.body;

      // Validate required fields
      if (!name || !currency || !accountNumber || !userId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Validate tokenized account number format
      if (!accountNumber.startsWith('TOK_') || accountNumber.split('_').length !== 3) {
        return res.status(400).json({ error: 'Invalid account number format' });
      }

      const wallet = new Wallet({
        name,
        currency,
        accountNumber,
        userId,
        balance: 0,
      });

      const savedWallet = await wallet.save();
      res.status(201).json(savedWallet);
    } catch (error) {
      console.error('Error creating wallet:', error);
      res.status(500).json({ error: 'Failed to create wallet' });
    }
  },

  // Get all wallets for a user
  getWalletsByUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const wallets = await Wallet.find({ userId });
      res.json(wallets);
    } catch (error) {
      console.error('Error fetching wallets:', error);
      res.status(500).json({ error: 'Failed to fetch wallets' });
    }
  },

  // Get a specific wallet
  getWallet: async (req, res) => {
    try {
      const wallet = await Wallet.findById(req.params.id);
      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }
      res.json(wallet);
    } catch (error) {
      console.error('Error fetching wallet:', error);
      res.status(500).json({ error: 'Failed to fetch wallet' });
    }
  },

  // Update wallet
  updateWallet: async (req, res) => {
    try {
      const { name, currency } = req.body;
      const wallet = await Wallet.findByIdAndUpdate(
        req.params.id,
        { name, currency },
        { new: true }
      );
      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }
      res.json(wallet);
    } catch (error) {
      console.error('Error updating wallet:', error);
      res.status(500).json({ error: 'Error updating wallet' });
    }
  },

  // Delete wallet
  deleteWallet: async (req, res) => {
    try {
      const wallet = await Wallet.findByIdAndDelete(req.params.id);
      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }
      res.json({ message: 'Wallet deleted successfully' });
    } catch (error) {
      console.error('Error deleting wallet:', error);
      res.status(500).json({ error: 'Error deleting wallet' });
    }
  },

  // Add a transaction to a wallet
  addTransaction: async (req, res) => {
    try {
      const { type, amount, description, category } = req.body;
      const walletId = req.params.id;

      // Validate required fields
      if (!type || !amount || !description || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const wallet = await Wallet.findById(walletId);
      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }

      // Check if there's enough balance for expense transactions
      if (type === 'expense' && wallet.balance < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      // Update balance
      const balanceChange = type === 'income' ? amount : -amount;
      wallet.balance += balanceChange;

      // Add transaction
      wallet.transactions.push({
        type,
        amount,
        description,
        category,
        date: new Date(),
      });

      const updatedWallet = await wallet.save();
      res.json(updatedWallet);
    } catch (error) {
      console.error('Error adding transaction:', error);
      res.status(500).json({ error: 'Failed to add transaction' });
    }
  },

  // Get transactions for a specific period
  getTransactions: async (req, res) => {
    try {
      const { id } = req.params;
      const { period = 'month' } = req.query;

      const wallet = await Wallet.findById(id);
      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }

      const now = new Date();
      let startDate = new Date();

      switch (period) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(now.getMonth() - 1); // Default to last month
      }

      const transactions = wallet.transactions.filter(
        transaction => new Date(transaction.date) >= startDate
      );

      res.json({
        transactions,
        period,
        startDate,
        endDate: now,
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  },

  // Get transactions summary
  getTransactionsSummary: async (req, res) => {
    try {
      const { id } = req.params;
      const { period } = req.query;
      
      const wallet = await Wallet.findById(id);
      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }

      const now = new Date();
      let startDate;

      switch (period) {
        case 'day':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(0); // All time
      }

      const transactions = wallet.transactions.filter(t => t.date >= startDate);
      
      const summary = {
        totalIncome: transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0),
        totalExpenses: transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0),
        transactions: transactions
      };

      res.json(summary);
    } catch (error) {
      console.error('Error getting transactions summary:', error);
      res.status(500).json({ error: 'Error getting transactions summary' });
    }
  }
};

module.exports = walletController; 