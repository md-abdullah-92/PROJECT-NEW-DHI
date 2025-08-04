// controllers/studentController.js
const Student = require('../models/Student');
const Class = require('../models/Class');
const Exam = require('../models/Exam');

// Get all students with pagination and filtering
const getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, class: className, status } = req.query;
    
    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { roll: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (className) query.class = className;
    if (status) query.status = status;

    const students = await Student.find(query)
      .populate('class', 'name section')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      data: students,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalStudents: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'শিক্ষার্থী তথ্য লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Get single student by ID
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('class', 'name section')
      .populate('results.exam', 'name type date');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'শিক্ষার্থী পাওয়া যায়নি'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'শিক্ষার্থী তথ্য লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Create new student
const createStudent = async (req, res) => {
  try {
    const {
      name,
      nameEn,
      fatherName,
      motherName,
      dateOfBirth,
      gender,
      phone,
      email,
      address,
      class: studentClass,
      roll,
      session,
      admissionDate,
      guardianPhone,
      guardianRelation,
      bloodGroup,
      religion,
      nationality
    } = req.body;

    // Check if roll number already exists in the same class
    const existingStudent = await Student.findOne({ 
      roll: roll, 
      class: studentClass 
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'এই রোল নম্বর ইতিমধ্যে ব্যবহৃত হয়েছে'
      });
    }

    const student = new Student({
      name,
      nameEn,
      fatherName,
      motherName,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      phone,
      email,
      address,
      class: studentClass,
      roll,
      session,
      admissionDate: new Date(admissionDate),
      guardianPhone,
      guardianRelation,
      bloodGroup,
      religion,
      nationality,
      status: 'active'
    });

    await student.save();
    await student.populate('class', 'name section');

    res.status(201).json({
      success: true,
      message: 'শিক্ষার্থী সফলভাবে যোগ করা হয়েছে',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'শিক্ষার্থী যোগ করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Convert date strings to Date objects
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }
    if (updateData.admissionDate) {
      updateData.admissionDate = new Date(updateData.admissionDate);
    }

    const student = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('class', 'name section');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'শিক্ষার্থী পাওয়া যায়নি'
      });
    }

    res.json({
      success: true,
      message: 'শিক্ষার্থীর তথ্য সফলভাবে আপডেট করা হয়েছে',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'শিক্ষার্থীর তথ্য আপডেট করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'শিক্ষার্থী পাওয়া যায়নি'
      });
    }

    res.json({
      success: true,
      message: 'শিক্ষার্থী সফলভাবে মুছে ফেলা হয়েছে'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'শিক্ষার্থী মুছতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Get student statistics for dashboard
const getStudentStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ status: 'active' });
    const totalMale = await Student.countDocuments({ 
      status: 'active', 
      gender: 'male' 
    });
    const totalFemale = await Student.countDocuments({ 
      status: 'active', 
      gender: 'female' 
    });

    // Students by class
    const studentsByClass = await Student.aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'classes',
          localField: 'class',
          foreignField: '_id',
          as: 'classInfo'
        }
      },
      { $unwind: '$classInfo' },
      {
        $group: {
          _id: '$classInfo.name',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Recent admissions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAdmissions = await Student.countDocuments({
      admissionDate: { $gte: thirtyDaysAgo },
      status: 'active'
    });

    res.json({
      success: true,
      data: {
        totalStudents,
        totalMale,
        totalFemale,
        recentAdmissions,
        studentsByClass
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'পরিসংখ্যান লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Get students by class
const getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const students = await Student.find({ 
      class: classId, 
      status: 'active' 
    })
    .populate('class', 'name section')
    .sort({ roll: 1 });

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'শিক্ষার্থী তথ্য লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Bulk operations
const bulkUpdateStudents = async (req, res) => {
  try {
    const { studentIds, updateData } = req.body;

    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      updateData
    );

    res.json({
      success: true,
      message: `${result.modifiedCount}টি শিক্ষার্থীর তথ্য আপডেট করা হয়েছে`,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'বাল্ক আপডেট করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats,
  getStudentsByClass,
  bulkUpdateStudents
};