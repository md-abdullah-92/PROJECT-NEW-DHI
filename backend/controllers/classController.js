const Class = require('../models/Class');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
exports.getAllClasses = asyncHandler(async (req, res, next) => {
  const classes = await Class.find().populate('classTeacher', 'profile.fullName');
  res.status(200).json({ success: true, count: classes.length, data: classes });
});

// @desc    Get single class by ID
// @route   GET /api/classes/:id
// @access  Private
exports.getClassById = asyncHandler(async (req, res, next) => {
  const singleClass = await Class.findById(req.params.id)
    .populate('classTeacher', 'profile.fullName')
    .populate('students', 'personalInfo.fullName rollNumber');

  if (!singleClass) {
    return next(new ErrorResponse(`Class not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: singleClass });
});

// @desc    Create new class
// @route   POST /api/classes
// @access  Private/Admin/Principal
exports.createClass = asyncHandler(async (req, res, next) => {
  const newClass = await Class.create(req.body);
  res.status(201).json({ success: true, data: newClass });
});

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private/Admin/Principal
exports.updateClass = asyncHandler(async (req, res, next) => {
  let singleClass = await Class.findById(req.params.id);

  if (!singleClass) {
    return next(new ErrorResponse(`Class not found with id of ${req.params.id}`, 404));
  }

  singleClass = await Class.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: singleClass });
});

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private/Admin/Principal
exports.deleteClass = asyncHandler(async (req, res, next) => {
  const singleClass = await Class.findById(req.params.id);

  if (!singleClass) {
    return next(new ErrorResponse(`Class not found with id of ${req.params.id}`, 404));
  }

  // TODO: Add logic to handle students in the class before deleting

  await singleClass.deleteOne();

  res.status(200).json({ success: true, data: {} });
});
