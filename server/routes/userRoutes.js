const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/', userController.createOrUpdateUser);

// Protected routes
router.get('/:email', auth, userController.getUserByEmail);
router.post('/logout', auth, userController.logout);
router.get('/password/expiration', auth, userController.checkPasswordExpiration);

module.exports = router; 