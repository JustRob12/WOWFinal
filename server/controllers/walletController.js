const Wallet = require('../models/Wallet');

// Create a new wallet
exports.createWallet = async (req, res) => {
  try {
    const { name, currency, userId } = req.body;
    const wallet = new Wallet({
      name,
      currency,
      userId,
      balance: 0 // Explicitly set initial balance to 0
    });
    await wallet.save();
    res.status(201).json(wallet);
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ error: 'Error creating wallet' });
  }
};

// Get all wallets for a user
exports.getWallets = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching wallets for user:', userId); // Debug log
    
    const wallets = await Wallet.find({ userId });
    console.log('Found wallets:', wallets); // Debug log
    
    // Ensure balance is a number and properly formatted
    const formattedWallets = wallets.map(wallet => ({
      ...wallet.toObject(),
      balance: Number(wallet.balance.toFixed(2))
    }));
    
    console.log('Formatted wallets:', formattedWallets); // Debug log
    res.json(formattedWallets);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Error fetching wallets' });
  }
};

// Get wallet by ID
exports.getWalletById = async (req, res) => {
  try {
    const wallet = await Wallet.findById(req.params.id);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    res.json(wallet);
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ error: 'Error fetching wallet' });
  }
};

// Update wallet
exports.updateWallet = async (req, res) => {
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
};

// Delete wallet
exports.deleteWallet = async (req, res) => {
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
};

// Add transaction
exports.addTransaction = async (req, res) => {
  try {
    const { type, amount, description, category } = req.body;
    const wallet = await Wallet.findById(req.params.id);
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Validate amount
    const transactionAmount = parseFloat(amount);
    if (isNaN(transactionAmount) || transactionAmount <= 0) {
      return res.status(400).json({ error: 'Invalid transaction amount' });
    }

    const transaction = {
      type,
      amount: transactionAmount,
      description,
      category,
      date: new Date()
    };

    // Update balance based on transaction type
    if (type === 'income') {
      wallet.balance = Number((wallet.balance + transactionAmount).toFixed(2));
    } else if (type === 'expense') {
      if (transactionAmount > wallet.balance) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }
      wallet.balance = Number((wallet.balance - transactionAmount).toFixed(2));
    }

    wallet.transactions.push(transaction);
    await wallet.save();
    
    res.json(wallet);
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ error: 'Error adding transaction' });
  }
};

// Get transactions summary
exports.getTransactionsSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const { period } = req.query; // 'day', 'week', 'month', 'year'
    
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
}; 