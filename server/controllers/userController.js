const User = require('../models/User');

// Create or update user
exports.createOrUpdateUser = async (req, res) => {
  try {
    const { email, displayName, photoURL } = req.body;
    
    let user = await User.findOne({ email });
    
    if (user) {
      user.displayName = displayName;
      user.photoURL = photoURL;
    } else {
      user = new User({
        email,
        displayName,
        photoURL
      });
    }

    await user.save();
    const token = await user.generateAuthToken();
    
    res.json({ user, token });
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

// Logout user
exports.logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.json({ message: 'Successfully logged out' });
  } catch (error) {
    res.status(500).json({ error: 'Error logging out' });
  }
}; 