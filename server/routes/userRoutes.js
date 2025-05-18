const express = require('express');
const router = express.Router();
const { createOrUpdateUser, getUserByEmail } = require('../controllers/userController');

// User routes
router.post('/', createOrUpdateUser);
router.get('/:email', getUserByEmail);

module.exports = router; 