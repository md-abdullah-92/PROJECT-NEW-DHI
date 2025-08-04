const Student = require('../models/Student');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc Get all students with advanced filtering, sorting, and pagination
// @route GET /api/students
// @access Private/Admin
exports.getAllStudents = asyncHandler(async (req, res, next) => {
  try {
    // Use advanced results middleware for filtering, sorting, and pagination
    res.status(200).json({
      success: true,
      count: res.advancedResults.count,
      pagination: res.advancedResults.pagination,
      data: res.advancedResults.data
    });
  } catch (error) {
    return next(new ErrorResponse('Error fetching students', 500));
  }
});

// @desc Get single student by ID
// @route GET /api/students/:id
// @access Private
exports.getStudentById = asyncHandler(async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('guardianInfo.primaryGuardian', 'profile.fullName profile.phone contactInfo.phone')
      .populate('academicInfo.class', 'name level description')
      .populate('academicInfo.teacher', 'profile.fullName profile.phone');

    if (!student) {
      return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return next(new ErrorResponse(`Invalid student ID format`, 400));
    }
    return next(new ErrorResponse('Error fetching student', 500));
  }
});

// @desc Create new student
// @route POST /api/students
// @access Private/Admin
exports.createStudent = asyncHandler(async (req, res, next) => {
  try {
    // Validate required fields
    const requiredFields = [
      'profile.fullName',
      'profile.dateOfBirth',
      'guardianInfo.fatherName',
      'guardianInfo.motherName',
      'guardianInfo.primaryGuardian',
      'contactInfo.phone',
      'contactInfo.address.current',
      'contactInfo.address.permanent',
      'academicInfo.class',
      'academicInfo.teacherName'
    ];

    const missingFields = [];

    // Check for missing required fields
    requiredFields.forEach(field => {
      const fieldParts = field.split('.');
      let value = req.body;

      for (const part of fieldParts) {
        value = value?.[part];
      }

      if (!value || (typeof value === 'string' && !value.trim())) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return next(new ErrorResponse(
        `Missing required fields: ${missingFields.join(', ')}`,
        400
      ));
    }

    // Validate phone number format (Bangladesh)
    const phoneRegex = /^01[3-9]\d{8}$/;
    const cleanPhone = req.body.contactInfo?.phone?.replace(/\s/g, '');

    if (!phoneRegex.test(cleanPhone)) {
      return next(new ErrorResponse('Invalid phone number format. Use 01XXXXXXXXX', 400));
    }

    // Validate date of birth (should not be in future)
    const dateOfBirth = new Date(req.body.profile.dateOfBirth);
    if (dateOfBirth > new Date()) {
      return next(new ErrorResponse('Date of birth cannot be in the future', 400));
    }

    // Validate admission date (should not be in future)
    if (req.body.academicInfo?.admissionDate) {
      const admissionDate = new Date(req.body.academicInfo.admissionDate);
      if (admissionDate > new Date()) {
        return next(new ErrorResponse('Admission date cannot be in the future', 400));
      }
    }

    // Check if student with same name and father's name already exists
    const existingStudent = await Student.findOne({
      'profile.fullName': req.body.profile.fullName,
      'guardianInfo.fatherName': req.body.guardianInfo.fatherName,
      status: { $ne: 'deleted' } // Exclude deleted students
    });

    if (existingStudent) {
      return next(new ErrorResponse(
        'A student with the same name and father\'s name already exists',
        409
      ));
    }

    // Generate unique student ID
    const studentId = await generateStudentId();

    // Add additional fields
    const studentData = {
      ...req.body,
      status: 'active',
      enrollmentDate: new Date(req.body.academicInfo?.admissionDate || Date.now()),
      studentId: studentId,
      createdBy: req.user?._id || null,
      lastUpdatedBy: req.user?._id || null,
      createdAt: new Date(),
      lastUpdatedAt: new Date()
    };

    // Clean phone number
    if (studentData.contactInfo?.phone) {
      studentData.contactInfo.phone = cleanPhone;
    }

    // Clean emergency contact if provided
    if (studentData.guardianInfo?.emergencyContact) {
      const cleanEmergencyContact = studentData.guardianInfo.emergencyContact.replace(/\s/g, '');
      if (cleanEmergencyContact && phoneRegex.test(cleanEmergencyContact)) {
        studentData.guardianInfo.emergencyContact = cleanEmergencyContact;
      }
    }

    // Create the student
    const student = await Student.create(studentData);

    // Populate the created student for response
    const populatedStudent = await Student.findById(student._id)
      .populate('academicInfo.class', 'name level')
      .populate('createdBy', 'profile.fullName');

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: populatedStudent
    });

  } catch (error) {
    console.error('Student creation error:', error);

    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return next(new ErrorResponse(message, 400));
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return next(new ErrorResponse(`Duplicate field value for ${field}`, 409));
    }

    return next(new ErrorResponse('Error creating student', 500));
  }
});

// @desc Update student
// @route PUT /api/students/:id
// @access Private/Admin
exports.updateStudent = asyncHandler(async (req, res, next) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
    }

    // Validate phone number if provided
    if (req.body.contactInfo?.phone) {
      const phoneRegex = /^01[3-9]\d{8}$/;
      const cleanPhone = req.body.contactInfo.phone.replace(/\s/g, '');

      if (!phoneRegex.test(cleanPhone)) {
        return next(new ErrorResponse('Invalid phone number format. Use 01XXXXXXXXX', 400));
      }
      req.body.contactInfo.phone = cleanPhone;
    }

    // Validate date of birth if provided
    if (req.body.profile?.dateOfBirth) {
      const dateOfBirth = new Date(req.body.profile.dateOfBirth);
      if (dateOfBirth > new Date()) {
        return next(new ErrorResponse('Date of birth cannot be in the future', 400));
      }
    }

    // Validate admission date if provided
    if (req.body.academicInfo?.admissionDate) {
      const admissionDate = new Date(req.body.academicInfo.admissionDate);
      if (admissionDate > new Date()) {
        return next(new ErrorResponse('Admission date cannot be in the future', 400));
      }
    }

    // Check for duplicate name and father's name (excluding current student)
    if (req.body.profile?.fullName || req.body.guardianInfo?.fatherName) {
      const duplicateQuery = {
        _id: { $ne: req.params.id },
        status: { $ne: 'deleted' }
      };

      if (req.body.profile?.fullName) {
        duplicateQuery['profile.fullName'] = req.body.profile.fullName;
      } else {
        duplicateQuery['profile.fullName'] = student.profile.fullName;
      }

      if (req.body.guardianInfo?.fatherName) {
        duplicateQuery['guardianInfo.fatherName'] = req.body.guardianInfo.fatherName;
      } else {
        duplicateQuery['guardianInfo.fatherName'] = student.guardianInfo.fatherName;
      }

      const existingStudent = await Student.findOne(duplicateQuery);
      if (existingStudent) {
        return next(new ErrorResponse(
          'A student with the same name and father\'s name already exists',
          409
        ));
      }
    }

    // Add update metadata
    const updateData = {
      ...req.body,
      lastUpdatedBy: req.user?._id || null,
      lastUpdatedAt: new Date()
    };

    student = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
        context: 'query'
      }
    ).populate('academicInfo.class', 'name level')
     .populate('lastUpdatedBy', 'profile.fullName');

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return next(new ErrorResponse(`Invalid student ID format`, 400));
    }

    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return next(new ErrorResponse(message, 400));
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return next(new ErrorResponse(`Duplicate field value for ${field}`, 409));
    }

    return next(new ErrorResponse('Error updating student', 500));
  }
});

// @desc Delete student (soft delete)
// @route DELETE /api/students/:id
// @access Private/Admin
exports.deleteStudent = asyncHandler(async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
    }

    // Soft delete - update status instead of actually deleting
    await Student.findByIdAndUpdate(
      req.params.id,
      {
        status: 'deleted',
        deletedAt: new Date(),
        lastUpdatedBy: req.user?._id || null,
        lastUpdatedAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
      data: {}
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return next(new ErrorResponse(`Invalid student ID format`, 400));
    }
    return next(new ErrorResponse('Error deleting student', 500));
  }
});

// @desc Permanently delete student
// @route DELETE /api/students/:id/permanent
// @access Private/SuperAdmin
exports.permanentDeleteStudent = asyncHandler(async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
    }

    await student.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Student permanently deleted',
      data: {}
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return next(new ErrorResponse(`Invalid student ID format`, 400));
    }
    return next(new ErrorResponse('Error permanently deleting student', 500));
  }
});

// @desc Restore deleted student
// @route PUT /api/students/:id/restore
// @access Private/Admin
exports.restoreStudent = asyncHandler(async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
    }

    if (student.status !== 'deleted') {
      return next(new ErrorResponse('Student is not deleted', 400));
    }

    const restoredStudent = await Student.findByIdAndUpdate(
      req.params.id,
      {
        status: 'active',
        deletedAt: null,
        lastUpdatedBy: req.user?._id || null,
        lastUpdatedAt: new Date()
      },
      { new: true }
    ).populate('academicInfo.class', 'name level');

    res.status(200).json({
      success: true,
      message: 'Student restored successfully',
      data: restoredStudent
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return next(new ErrorResponse(`Invalid student ID format`, 400));
    }
    return next(new ErrorResponse('Error restoring student', 500));
  }
});

// @desc Get students by class
// @route GET /api/students/class/:classId
// @access Private
exports.getStudentsByClass = asyncHandler(async (req, res, next) => {
  try {
    const students = await Student.find({
      'academicInfo.class': req.params.classId,
      status: 'active'
    })
    .populate('academicInfo.class', 'name level')
    .populate('guardianInfo.primaryGuardian', 'profile.fullName contactInfo.phone')
    .select('profile guardianInfo contactInfo academicInfo status studentId')
    .sort('profile.fullName');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return next(new ErrorResponse(`Invalid class ID format`, 400));
    }
    return next(new ErrorResponse('Error fetching students by class', 500));
  }
});

// @desc Search students
// @route GET /api/students/search
// @access Private
exports.searchStudents = asyncHandler(async (req, res, next) => {
  try {
    const { q, class: classFilter, status = 'active' } = req.query;

    if (!q || q.trim().length < 2) {
      return next(new ErrorResponse('Search query must be at least 2 characters', 400));
    }

    const searchQuery = {
      status,
      $or: [
        { 'profile.fullName': { $regex: q, $options: 'i' } },
        { 'guardianInfo.fatherName': { $regex: q, $options: 'i' } },
        { 'guardianInfo.motherName': { $regex: q, $options: 'i' } },
        { studentId: { $regex: q, $options: 'i' } },
        { 'contactInfo.phone': { $regex: q.replace(/\s/g, ''), $options: 'i' } }
      ]
    };

    if (classFilter) {
      searchQuery['academicInfo.class'] = classFilter;
    }

    const students = await Student.find(searchQuery)
      .populate('academicInfo.class', 'name level')
      .select('profile guardianInfo contactInfo academicInfo status studentId')
      .sort('profile.fullName')
      .limit(50);

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (error) {
    return next(new ErrorResponse('Error searching students', 500));
  }
});

// @desc Get student statistics
// @route GET /api/students/stats
// @access Private/Admin
exports.getStudentStats = asyncHandler(async (req, res, next) => {
  try {
    const stats = await Student.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const classCounts = await Student.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: '$academicInfo.class',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'classes',
          localField: '_id',
          foreignField: '_id',
          as: 'classInfo'
        }
      },
      {
        $project: {
          className: { $arrayElemAt: ['$classInfo.name', 0] },
          count: 1
        }
      }
    ]);

    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'active' });
    const inactiveStudents = await Student.countDocuments({ status: 'inactive' });
    const deletedStudents = await Student.countDocuments({ status: 'deleted' });

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        inactiveStudents,
        deletedStudents,
        statusBreakdown: stats,
        classBreakdown: classCounts
      }
    });

  } catch (error) {
    return next(new ErrorResponse('Error fetching student statistics', 500));
  }
});

// Helper function to generate unique student ID
const generateStudentId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `STU${currentYear}`;

  // Find the last student ID for the current year
  const lastStudent = await Student.findOne({
    studentId: { $regex: `^${prefix}` }
  }).sort({ studentId: -1 });

  let nextNumber = 1;
  if (lastStudent) {
    const lastNumber = parseInt(lastStudent.studentId.replace(prefix, ''));
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
};