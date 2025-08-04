const express = require('express');
const {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass
} = require('../controllers/classController');

const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
  .get(getAllClasses)
  .post(restrictTo('admin', 'principal'), createClass);

router.route('/:id')
  .get(getClassById)
  .put(restrictTo('admin', 'principal'), updateClass)
  .delete(restrictTo('admin', 'principal'), deleteClass);

module.exports = router;
