const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Protect routes - verify JWT token
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // Check if user is active
  if (!currentUser.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact administrator.', 403));
  }

  // Check if account is locked
  if (currentUser.isLocked) {
    return next(new AppError('Account is temporarily locked. Please try again later.', 423));
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

// Restrict to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Optional authentication - for routes that work with or without auth
exports.optionalAuth = catchAsync(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token && token !== 'loggedout') {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (currentUser && currentUser.isActive) {
        req.user = currentUser;
      }
    } catch (error) {
      // Token is invalid, but that's okay for optional auth
      req.user = null;
    }
  }

  next();
});

// Check if user owns resource or has admin privileges
exports.checkOwnership = (resourceUserField = 'user') => {
  return (req, res, next) => {
    // Admin and principal can access all resources
    if (req.user.role === 'admin' || req.user.role === 'principal') {
      return next();
    }

    // Check if user owns the resource
    if (req.resource && req.resource[resourceUserField]) {
      if (req.resource[resourceUserField].toString() !== req.user.id) {
        return next(new AppError('You can only access your own resources', 403));
      }
    }

    next();
  };
};

// Check if teacher has access to student
exports.checkTeacherStudentAccess = catchAsync(async (req, res, next) => {
  if (req.user.role === 'principal' || req.user.role === 'admin') {
    return next();
  }

  if (req.user.role === 'teacher') {
    // Teachers can access students in their classes
    const Student = require('../models/Student');
    const student = await Student.findById(req.params.id).populate('academicInfo.class');
    
    if (!student) {
      return next(new AppError('Student not found', 404));
    }

    // Check if teacher teaches this student's class
    const teacherClasses = req.user.teacherData.classes.map(c => c.toString());
    if (!teacherClasses.includes(student.academicInfo.class._id.toString())) {
      return next(new AppError('You do not have access to this student', 403));
    }

    req.student = student;
  }

  next();
});

// Check if guardian has access to student
exports.checkGuardianStudentAccess = catchAsync(async (req, res, next) => {
  if (req.user.role === 'principal' || req.user.role === 'admin') {
    return next();
  }

  if (req.user.role === 'guardian') {
    const Student = require('../models/Student');
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return next(new AppError('Student not found', 404));
    }

    // Check if guardian is the primary guardian of this student
    if (student.guardianInfo.primaryGuardian.toString() !== req.user.id) {
      return next(new AppError('You can only access your own children', 403));
    }

    req.student = student;
  }

  next();
});