const { validationResult } = require('express-validator');
const User = require('../models/User');
const Student = require('../models/Student');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Create and send simple response without JWT
const createSendResponse = (user, statusCode, res, message = 'Success') => {
  // Remove sensitive information from output
  user.password = undefined;
  user.loginAttempts = undefined;
  user.lockUntil = undefined;

  res.status(statusCode).json({
    status: 'success',
    message,
    data: { user }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const {
    username,
    email,
    password,
    role,
    fullName,
    fullNameBangla,
    phone,
    address,
    teacherData,
    guardianData
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });
  if (existingUser) {
    return next(new AppError('User with this email or username already exists', 400));
  }

  // Create user object
  const userData = {
    username,
    email,
    password, // store plain text (not secure for production)
    role,
    profile: { fullName, fullNameBangla, phone, address }
  };

  if (role === 'teacher' && teacherData) userData.teacherData = teacherData;
  if (role === 'guardian' && guardianData) userData.guardianData = guardianData;

  const newUser = await User.create(userData);
  createSendResponse(newUser, 201, res, 'User registered successfully');
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed', 400, errors.array()));
  }

  const { username, password, role } = req.body;
  let user;

  if (role === 'guardian') {
    const student = await Student.findOne({ studentId: username });
    if (student) {
      user = await User.findById(student.guardianInfo.primaryGuardian).select('+password');
    }
  } else {
    user = await User.findOne({
      $or: [{ username }, { email: username }],
      role
    }).select('+password');
  }

  if (!user) return next(new AppError('Invalid credentials', 401));
  if (user.isLocked) return next(new AppError('Account locked. Try later.', 423));
  if (!user.isActive) return next(new AppError('Account deactivated.', 403));

  // Plain text password check (no bcrypt)
  const isPasswordCorrect =
    user.password === password ||
    (user.correctPassword && await user.correctPassword(password)); // fallback if some accounts hashed

  if (!isPasswordCorrect) {
    await user.incLoginAttempts();
    return next(new AppError('Invalid credentials', 401));
  }

  if (user.loginAttempts > 0) await user.resetLoginAttempts();

  let additionalData = {};
  if (role === 'guardian') {
    additionalData.students = await Student.find({
      'guardianInfo.primaryGuardian': user._id
    }).populate('academicInfo.class');
  } else if (role === 'teacher') {
    additionalData.teacherInfo = user.teacherData;
  }

  createSendResponse(user, 200, res, 'Login successful');
});

// @desc    Logout user
exports.logout = catchAsync(async (req, res) => {
  const { userId } = req.body;

  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
});


// @desc    Forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new AppError('No user with that email', 404));

  const resetToken = Math.random().toString(36).substring(2) +
                     Math.random().toString(36).substring(2);

  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Password reset token generated',
    resetToken // dev only
  });
});

// @desc    Reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  });
  if (!user) return next(new AppError('Token invalid or expired', 400));

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendResponse(user, 200, res, 'Password reset successfully');
});

// @desc    Get current user
exports.getMe = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) return next(new AppError('User ID is required', 400));

  const user = await User.findById(userId);
  if (!user) return next(new AppError('User not found', 404));


  let additionalData = {};
  if (user.role === 'guardian') {
    additionalData.students = await Student.find({
      'guardianInfo.primaryGuardian': user._id
    }).populate('academicInfo.class');
  } else if (user.role === 'teacher') {
    additionalData.teacherInfo = user.teacherData;
  }

  res.status(200).json({
    status: 'success',
    data: { user, ...additionalData }
  });
});

// @desc    Update password
exports.updatePassword = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new AppError('Validation failed', 400, errors.array()));

  const { userId, currentPassword, newPassword } = req.body;
  if (!userId) return next(new AppError('User ID is required', 400));

  const user = await User.findById(userId).select('+password');
  if (!user) return next(new AppError('User not found', 404));


  // Plain password check
  if (user.password !== currentPassword &&
      !(user.correctPassword && await user.correctPassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 401));
  }

  user.password = newPassword;
  await user.save();

  createSendResponse(user, 200, res, 'Password updated successfully');
});
