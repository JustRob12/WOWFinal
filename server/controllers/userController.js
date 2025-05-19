const User = require('../models/User');
const { admin } = require('../config/firebase');
const bcrypt = require('bcryptjs');

// Create or update user
exports.createOrUpdateUser = async (req, res) => {
  try {
    const { uid, email, fullName, password, passwordLastChanged } = req.body;

    // Validate required fields
    if (!uid || !email || !fullName) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Update existing user (do not hash password)
      const updatedUser = await User.findOneAndUpdate(
        { email },
        {
          fullName,
          passwordLastChanged,
          updatedAt: new Date()
        },
        { new: true }
      );
      return res.json(updatedUser);
    }

    // Create new user (hash password)
    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      return res.status(400).json({ error: 'A valid password is required for new users' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = await new User({
      uid,
      email,
      fullName,
      passwordHash,
      passwordLastChanged,
      createdAt: new Date(),
      updatedAt: new Date()
    }).save();
    res.json(newUser);
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({
      error: 'Error creating/updating user'
    });
  }
};

// Get user by email
exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      error: 'Error fetching user'
    });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    // In a real application, you might want to:
    // 1. Invalidate the user's session
    // 2. Clear any server-side tokens
    // 3. Update last logout timestamp
    
    const { email } = req.user;
    await User.findOneAndUpdate(
      { email },
      { lastLogout: new Date() }
    );

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({
      error: 'Error during logout'
    });
  }
};

// Check password expiration
exports.checkPasswordExpiration = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const passwordAge = new Date() - new Date(user.passwordLastChanged);
    const passwordExpirationPeriod = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds

    const needsPasswordChange = passwordAge > passwordExpirationPeriod;

    res.json({
      needsPasswordChange,
      daysUntilExpiration: needsPasswordChange ? 0 : Math.floor((passwordExpirationPeriod - passwordAge) / (24 * 60 * 60 * 1000))
    });
  } catch (error) {
    console.error('Error checking password expiration:', error);
    res.status(500).json({
      error: 'Error checking password expiration'
    });
  }
}; 