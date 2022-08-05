const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');

// Signup
router.post('/signup', userController.user_signup);

// Login to receive JWT
router.post('/login', userController.user_login);

// Update User Info
router.patch('/', userController.user_update);

// Verify JWT
router.get('/:token', userController.user_verify);

// Refresh Session
router.patch('/:token', userController.user_refresh);

// Delete User
router.delete('/', userController.user_delete);

router.patch('/password', userController.user_update_password);

module.exports = router;