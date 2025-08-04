const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'ব্যবহারকারীর নাম প্রয়োজন'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'ইমেইল প্রয়োজন'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'পাসওয়ার্ড প্রয়োজন'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['principal', 'teacher', 'staff', 'student'],
    required: [true, 'ভূমিকা প্রয়োজন']
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'profileModel'
  },
  profileModel: {
    type: String,
    enum: ['Teacher', 'Student']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  permissions: [{
    type: String
  }]
}, {
  timestamps: true
});

// Simple password comparison method (no hashing)
userSchema.methods.comparePassword = function(candidatePassword) {
  return this.password === candidatePassword;
};

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);