const User = require('../models/User');

// Create or update user
exports.createOrUpdateUser = async (req, res) => {
  try {
    const { email, displayName, photoURL } = req.body;
    
    const user = await User.findOneAndUpdate(
      { email },
      { email, displayName, photoURL },
      { upsert: true, new: true }
    );
    
    res.json(user);
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Error saving user' });
  }
};

// Get user by email
exports.getUserByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Error fetching user' });
  }
}; 