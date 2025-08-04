const express = require('express');
const {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam
} = require('../controllers/examController');

const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
  .get(getAllExams)
  .post(restrictTo('admin', 'principal'), createExam);

router.route('/:id')
  .get(getExamById)
  .put(restrictTo('admin', 'principal'), updateExam)
  .delete(restrictTo('admin', 'principal'), deleteExam);

module.exports = router;
