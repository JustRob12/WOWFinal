const express = require('express');
const router = express.Router();
const { createOrUpdateUser, getUserByEmail, logout } = require('../controllers/userController');
const auth = require('../middleware/auth');

// Public routes
router.post('/', createOrUpdateUser);

// Protected routes
router.get('/:email', auth, getUserByEmail);
router.post('/logout', auth, logout);

module.exports = router; 