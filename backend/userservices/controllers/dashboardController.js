// controllers/dashboardController.js
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Exam = require('../models/Exam');
const Notice = require('../models/Notice');

// Get dashboard overview statistics
const getDashboardStats = async (req, res) => {
  try {
    // Basic counts
    const totalStudents = await Student.countDocuments({ status: 'active' });
    const totalTeachers = await Teacher.countDocuments({ status: 'active' });
    const totalClasses = await Class.countDocuments({ status: 'active' });
    const totalNotices = await Notice.countDocuments({ status: 'active' });

    // Student statistics
    const maleStudents = await Student.countDocuments({ 
      status: 'active', 
      gender: 'male' 
    });
    const femaleStudents = await Student.countDocuments({ 
      status: 'active', 
      gender: 'female' 
    });

    // Recent admissions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAdmissions = await Student.countDocuments({
      admissionDate: { $gte: thirtyDaysAgo },
      status: 'active'
    });

    // Exam statistics
    const totalExams = await Exam.countDocuments();
    const completedExams = await Exam.countDocuments({ status: 'completed' });
    const upcomingExams = await Exam.countDocuments({ 
      status: 'scheduled',
      examDate: { $gte: new Date() }
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
          count: { $sum: 1 },
          className: { $first: '$classInfo.name' }
        }
      },
      { $sort: { className: 1 } },
      { $limit: 10 }
    ]);

    // Monthly admission trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const admissionTrend = await Student.aggregate([
      {
        $match: {
          admissionDate: { $gte: sixMonthsAgo },
          status: 'active'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$admissionDate' },
            month: { $month: '$admissionDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Recent notices
    const recentNotices = await Notice.find({
      status: 'active',
      $or: [
        { validTo: null },
        { validTo: { $gte: new Date() } }
      ]
    })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title type priority createdAt createdBy');

    // Upcoming exams
    const upcomingExamsList = await Exam.find({
      status: 'scheduled',
      examDate: { $gte: new Date() }
    })
    .populate('classes', 'name section')
    .sort({ examDate: 1 })
    .limit(5)
    .select('name type examDate classes');

    // Teacher statistics by designation
    const teachersByDesignation = await Teacher.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$designation',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalTeachers,
          totalClasses,
          totalNotices,
          maleStudents,
          femaleStudents,
          recentAdmissions,
          totalExams,
          completedExams,
          upcomingExams
        },
        charts: {
          studentsByClass,
          admissionTrend,
          teachersByDesignation
        },
        recent: {
          notices: recentNotices,
          upcomingExams: upcomingExamsList
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ড্যাশবোর্ড তথ্য লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Get attendance overview (if you have attendance model)
const getAttendanceOverview = async (req, res) => {
  try {
    // This would require an Attendance model
    // For now, returning mock data structure
    res.json({
      success: true,
      data: {
        todayAttendance: {
          present: 0,
          absent: 0,
          late: 0,
          percentage: 0
        },
        weeklyTrend: [],
        classwiseAttendance: []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'উপস্থিতির তথ্য লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Get financial overview (if you have fee/payment models)
const getFinancialOverview = async (req, res) => {
  try {
    // This would require Fee/Payment models
    // For now, returning mock data structure
    res.json({
      success: true,
      data: {
        monthlyCollection: 0,
        totalDue: 0,
        collectionTrend: [],
        feeStatus: {
          paid: 0,
          due: 0,
          partial: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'আর্থিক তথ্য লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Get academic calendar events
const getAcademicCalendar = async (req, res) => {
  try {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Get upcoming exams
    const upcomingExams = await Exam.find({
      examDate: { $gte: today, $lte: nextMonth }
    })
    .populate('classes', 'name')
    .select('name type examDate classes')
    .sort({ examDate: 1 });

    // Format events for calendar
    const events = upcomingExams.map(exam => ({
      id: exam._id,
      title: exam.name,
      type: 'exam',
      date: exam.examDate,
      description: `${exam.type} - ${exam.classes.map(c => c.name).join(', ')}`
    }));

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'একাডেমিক ক্যালেন্ডার লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Get quick actions data
const getQuickActions = async (req, res) => {
  try {
    // Count of items that need attention
    const pendingExams = await Exam.countDocuments({ status: 'scheduled' });
    const draftNotices = await Notice.countDocuments({ status: 'draft' });
    const inactiveStudents = await Student.countDocuments({ status: 'inactive' });
    
    // Recent activities
    const recentStudents = await Student.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name class roll admissionDate');

    const recentTeachers = await Teacher.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name designation joiningDate');

    res.json({
      success: true,
      data: {
        pending: {
          exams: pendingExams,
          notices: draftNotices,
          inactiveStudents
        },
        recent: {
          students: recentStudents,
          teachers: recentTeachers
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'কুইক অ্যাকশন তথ্য লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Search across all entities
const globalSearch = async (req, res) => {
  try {
    const { query, type, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'সার্চ কুয়েরি প্রয়োজন'
      });
    }

    const searchRegex = { $regex: query, $options: 'i' };
    const results = {};

    // Search students
    if (!type || type === 'students') {
      results.students = await Student.find({
        $or: [
          { name: searchRegex },
          { roll: searchRegex },
          { phone: searchRegex }
        ],
        status: 'active'
      })
      .populate('class', 'name')
      .limit(parseInt(limit))
      .select('name roll class phone');
    }

    // Search teachers
    if (!type || type === 'teachers') {
      results.teachers = await Teacher.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { employeeId: searchRegex }
        ],
        status: 'active'
      })
      .limit(parseInt(limit))
      .select('name designation email phone employeeId');
    }

    // Search exams
    if (!type || type === 'exams') {
      results.exams = await Exam.find({
        name: searchRegex
      })
      .limit(parseInt(limit))
      .select('name type examDate status');
    }

    // Search notices
    if (!type || type === 'notices') {
      results.notices = await Notice.find({
        $or: [
          { title: searchRegex },
          { content: searchRegex }
        ],
        status: 'active'
      })
      .limit(parseInt(limit))
      .select('title type priority createdAt');
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'সার্চ করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getAttendanceOverview,
  getFinancialOverview,
  getAcademicCalendar,
  getQuickActions,
  globalSearch
};