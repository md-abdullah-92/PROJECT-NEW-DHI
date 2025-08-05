const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Username can only contain letters, numbers, dots, hyphens, and underscores'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
    // Removed complex password requirements for simpler authentication
  
  body('role')
    .isIn(['principal', 'teacher', 'guardian'])
    .withMessage('Role must be principal, teacher, or guardian'),
  
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('phone')
    .optional()
    .matches(/^(\+88)?01[3-9]\d{8}$/)
    .withMessage('Please provide a valid Bangladeshi phone number')
];

const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username/Email is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  body('role')
    .isIn(['principal', 'teacher', 'guardian'])
    .withMessage('Role must be principal, teacher, or guardian')
];

const updatePasswordValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
    
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];


const userIdValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
];

// Public routes (no authentication required)
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);
router.patch('/reset-password/:token', resetPasswordValidation, authController.resetPassword);

// User-specific routes (require userId in request body for validation)
router.post('/me', userIdValidation, authController.getMe);
router.post('/logout', authController.logout); // userId optional for logout
router.patch('/update-password', updatePasswordValidation, authController.updatePassword);

module.exports = router;