const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  rollNumber: { type: String, required: true },
  personalInfo: {
    fullName: { type: String, required: true },
    fullNameBangla: { type: String },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    bloodGroup: { type: String },
    nationality: { type: String, default: 'Bangladeshi' },
    religion: { type: String }
  },
  contactInfo: {
    phone: { type: String },
    email: { type: String },
    presentAddress: { type: String },
    permanentAddress: { type: String }
  },
  guardianInfo: {
    father: {
      name: { type: String, required: true },
      nameBangla: { type: String },
      phone: { type: String },
      occupation: { type: String },
      nid: { type: String }
    },
    mother: {
      name: { type: String, required: true },
      nameBangla: { type: String },
      phone: { type: String },
      occupation: { type: String }
    },
    primaryGuardian: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  academicInfo: {
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    section: { type: String },
    group: { type: String },
    admissionDate: { type: Date },
    academicYear: { type: String }
  },
  financialInfo: {
    admissionFee: { type: Number },
    monthlyFee: { type: Number },
    examFee: { type: Number },
    scholarship: { type: String },
    scholarshipAmount: { type: Number }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated', 'deleted'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);