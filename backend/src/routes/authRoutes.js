const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const {
  register, login, getMe,
  updateProfile, changePassword, searchUsers,
} = require('../controllers/authController');

const { authenticate } = require('../middleware/auth');
const validate         = require('../middleware/validate');

// Public Routes
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin','manager','member']).withMessage('Invalid role'),
], validate, register);

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, login);

// Protected Routes
router.get('/me',      authenticate, getMe);
router.get('/users',   authenticate, searchUsers);

router.put('/profile', authenticate, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio max 500 characters'),
], validate, updateProfile);

router.put('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], validate, changePassword);

module.exports = router;