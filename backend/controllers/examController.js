const Exam = require('../models/Exam');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all exams
// @route   GET /api/exams
// @access  Private
exports.getAllExams = asyncHandler(async (req, res, next) => {
  const exams = await Exam.find().populate('classes', 'name');
  res.status(200).json({ success: true, count: exams.length, data: exams });
});

// @desc    Get single exam by ID
// @route   GET /api/exams/:id
// @access  Private
exports.getExamById = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id).populate('classes', 'name');

  if (!exam) {
    return next(new ErrorResponse(`Exam not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: exam });
});

// @desc    Create new exam
// @route   POST /api/exams
// @access  Private/Admin/Principal
exports.createExam = asyncHandler(async (req, res, next) => {
  const exam = await Exam.create(req.body);
  res.status(201).json({ success: true, data: exam });
});

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private/Admin/Principal
exports.updateExam = asyncHandler(async (req, res, next) => {
  let exam = await Exam.findById(req.params.id);

  if (!exam) {
    return next(new ErrorResponse(`Exam not found with id of ${req.params.id}`, 404));
  }

  exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: exam });
});

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private/Admin/Principal
exports.deleteExam = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    return next(new ErrorResponse(`Exam not found with id of ${req.params.id}`, 404));
  }

  await exam.deleteOne();

  res.status(200).json({ success: true, data: {} });
});
