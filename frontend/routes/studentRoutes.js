const express = require('express');
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');

const Student = require('../models/Student');
const advancedResults = require('../middleware/advancedResults');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
  .get(restrictTo('admin', 'teacher', 'principal'), advancedResults(Student, 'academicInfo.class'), getAllStudents)
  .post(restrictTo('admin', 'principal'), createStudent);

router.route('/:id')
  .get(restrictTo('admin', 'teacher', 'principal', 'guardian'), getStudentById)
  .put(restrictTo('admin', 'principal'), updateStudent)
  .delete(restrictTo('admin', 'principal'), deleteStudent);

module.exports = router;
