const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exam name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['midterm', 'final', 'quiz', 'assignment'],
    required: [true, 'Exam type is required']
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  subjects: [{
    name: String,
    date: Date,
    time: String,
    marks: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Exam', examSchema);
