// teacherRoutes.js (Combined with controllers for testing)

const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// -------------------- Controllers --------------------
const getAllTeachers = (req, res) => {
  res.json({ message: 'List of all teachers' });
};

const getTeacherById = (req, res) => {
  const { id } = req.params;
  res.json({ message: `Details of teacher with ID: ${id}` });
};

const updateTeacher = (req, res) => {
  const { id } = req.params;
  res.json({ message: `Teacher with ID: ${id} updated` });
};

const deleteTeacher = (req, res) => {
  const { id } = req.params;
  res.json({ message: `Teacher with ID: ${id} deleted` });
};

// -------------------- Routes --------------------

// Protect all routes
router.use(protect);

router.route('/')
  .get(restrictTo('admin', 'principal'), getAllTeachers);

router.route('/:id')
  .get(restrictTo('admin', 'principal', 'teacher'), getTeacherById)
  .put(restrictTo('admin', 'principal'), updateTeacher)
  .delete(restrictTo('admin', 'principal'), deleteTeacher);

module.exports = router;
