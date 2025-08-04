// controllers/examController.js
const Exam = require('../models/Exam');
const Student = require('../models/Student');
const Class = require('../models/Class');

// Get all exams
const getAllExams = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, type, status, class: className } = req.query;
    
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (type) query.type = type;
    if (status) query.status = status;
    if (className) query.classes = { $in: [className] };

    const exams = await Exam.find(query)
      .populate('classes', 'name section')
      .sort({ examDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Exam.countDocuments(query);

    res.json({
      success: true,
      data: exams,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalExams: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'পরীক্ষার তথ্য লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Get single exam
const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('classes', 'name section')
      .populate('results.student', 'name roll')
      .populate('results.subjects.subject', 'name');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'পরীক্ষা পাওয়া যায়নি'
      });
    }

    res.json({
      success: true,
      data: exam
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'পরীক্ষার তথ্য লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Create new exam
const createExam = async (req, res) => {
  try {
    const {
      name,
      type,
      examDate,
      classes,
      subjects,
      totalMarks,
      passMarks,
      duration,
      instructions,
      session
    } = req.body;

    const exam = new Exam({
      name,
      type,
      examDate: new Date(examDate),
      classes,
      subjects,
      totalMarks,
      passMarks,
      duration,
      instructions,
      session,
      status: 'scheduled'
    });

    await exam.save();
    await exam.populate('classes', 'name section');

    res.status(201).json({
      success: true,
      message: 'পরীক্ষা সফলভাবে তৈরি করা হয়েছে',
      data: exam
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'পরীক্ষা তৈরি করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Update exam
const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    if (updateData.examDate) {
      updateData.examDate = new Date(updateData.examDate);
    }

    const exam = await Exam.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('classes', 'name section');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'পরীক্ষা পাওয়া যায়নি'
      });
    }

    res.json({
      success: true,
      message: 'পরীক্ষার তথ্য সফলভাবে আপডেট করা হয়েছে',
      data: exam
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'পরীক্ষার তথ্য আপডেট করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Delete exam
const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'পরীক্ষা পাওয়া যায়নি'
      });
    }

    res.json({
      success: true,
      message: 'পরীক্ষা সফলভাবে মুছে ফেলা হয়েছে'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'পরীক্ষা মুছতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Add/Update exam results
const addExamResults = async (req, res) => {
  try {
    const { examId } = req.params;
    const { results } = req.body; // Array of student results

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'পরীক্ষা পাওয়া যায়নি'
      });
    }

    // Process each result
    for (const result of results) {
      const existingResultIndex = exam.results.findIndex(
        r => r.student.toString() === result.student
      );

      const studentResult = {
        student: result.student,
        subjects: result.subjects, // Array of {subject, marks, grade}
        totalMarks: result.totalMarks,
        obtainedMarks: result.obtainedMarks,
        percentage: result.percentage,
        grade: result.grade,
        status: result.status, // pass/fail
        position: result.position || null
      };

      if (existingResultIndex >= 0) {
        exam.results[existingResultIndex] = studentResult;
      } else {
        exam.results.push(studentResult);
      }

      // Update student's result history
      await Student.findByIdAndUpdate(
        result.student,
        {
          $addToSet: {
            examResults: {
              exam: examId,
              totalMarks: result.totalMarks,
              obtainedMarks: result.obtainedMarks,
              percentage: result.percentage,
              grade: result.grade,
              status: result.status,
              date: exam.examDate
            }
          }
        }
      );
    }

    exam.status = 'completed';
    await exam.save();

    res.json({
      success: true,
      message: 'পরীক্ষার ফলাফল সফলভাবে যোগ করা হয়েছে',
      data: exam
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ফলাফল যোগ করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Get exam results by class
const getExamResultsByClass = async (req, res) => {
  try {
    const { examId, classId } = req.params;

    const exam = await Exam.findById(examId)
      .populate({
        path: 'results.student',
        match: { class: classId },
        select: 'name roll class'
      })
      .populate('results.subjects.subject', 'name');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'পরীক্ষা পাওয়া যায়নি'
      });
    }

    // Filter results for the specific class
    const classResults = exam.results.filter(result => 
      result.student && result.student.class && result.student.class.toString() === classId
    );

    res.json({
      success: true,
      data: {
        exam: {
          _id: exam._id,
          name: exam.name,
          type: exam.type,
          examDate: exam.examDate
        },
        results: classResults
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ফলাফল লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Get student's all exam results
const getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId)
      .populate({
        path: 'examResults.exam',
        select: 'name type examDate'
      });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'শিক্ষার্থী পাওয়া যায়নি'
      });
    }

    res.json({
      success: true,
      data: {
        student: {
          _id: student._id,
          name: student.name,
          roll: student.roll,
          class: student.class
        },
        results: student.examResults
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ফলাফল লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Get exam statistics
const getExamStats = async (req, res) => {
  try {
    const totalExams = await Exam.countDocuments();
    const completedExams = await Exam.countDocuments({ status: 'completed' });
    const scheduledExams = await Exam.countDocuments({ status: 'scheduled' });
    const ongoingExams = await Exam.countDocuments({ status: 'ongoing' });

    // Recent exams (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentExams = await Exam.countDocuments({
      examDate: { $gte: thirtyDaysAgo }
    });

    // Exams by type
    const examsByType = await Exam.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalExams,
        completedExams,
        scheduledExams,
        ongoingExams,
        recentExams,
        examsByType
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

// Generate merit list for exam
const generateMeritList = async (req, res) => {
  try {
    const { examId } = req.params;
    const { classId } = req.query;

    const exam = await Exam.findById(examId)
      .populate({
        path: 'results.student',
        select: 'name roll class',
        match: classId ? { class: classId } : {}
      });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'পরীক্ষা পাওয়া যায়নি'
      });
    }

    // Filter and sort results
    let meritList = exam.results
      .filter(result => result.student && result.status === 'pass')
      .sort((a, b) => b.percentage - a.percentage)
      .map((result, index) => ({
        position: index + 1,
        student: result.student,
        obtainedMarks: result.obtainedMarks,
        totalMarks: result.totalMarks,
        percentage: result.percentage,
        grade: result.grade
      }));

    res.json({
      success: true,
      data: {
        exam: {
          _id: exam._id,
          name: exam.name,
          type: exam.type,
          examDate: exam.examDate
        },
        meritList
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'মেধা তালিকা তৈরি করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Get upcoming exams
const getUpcomingExams = async (req, res) => {
  try {
    const { classId } = req.query;
    const currentDate = new Date();
    
    let query = {
      examDate: { $gte: currentDate },
      status: 'scheduled'
    };
    
    if (classId) {
      query.classes = { $in: [classId] };
    }

    const upcomingExams = await Exam.find(query)
      .populate('classes', 'name section')
      .sort({ examDate: 1 })
      .limit(10);

    res.json({
      success: true,
      data: upcomingExams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'আসন্ন পরীক্ষার তথ্য লোড করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

// Calculate class average for exam
const getClassAverage = async (req, res) => {
  try {
    const { examId, classId } = req.params;

    const exam = await Exam.findById(examId)
      .populate({
        path: 'results.student',
        match: { class: classId },
        select: 'name roll class'
      });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'পরীক্ষা পাওয়া যায়নি'
      });
    }

    const classResults = exam.results.filter(result => 
      result.student && result.student.class && result.student.class.toString() === classId
    );

    if (classResults.length === 0) {
      return res.json({
        success: true,
        data: {
          average: 0,
          totalStudents: 0,
          passCount: 0,
          failCount: 0
        }
      });
    }

    const totalMarks = classResults.reduce((sum, result) => sum + result.obtainedMarks, 0);
    const average = totalMarks / classResults.length;
    const passCount = classResults.filter(result => result.status === 'pass').length;
    const failCount = classResults.length - passCount;

    res.json({
      success: true,
      data: {
        average: Math.round(average * 100) / 100,
        totalStudents: classResults.length,
        passCount,
        failCount,
        passPercentage: Math.round((passCount / classResults.length) * 100 * 100) / 100
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ক্লাসের গড় হিসাব করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
};

module.exports = {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  addExamResults,
  getExamResultsByClass,
  getStudentResults,
  getExamStats,
  generateMeritList,
  getUpcomingExams,
  getClassAverage
};