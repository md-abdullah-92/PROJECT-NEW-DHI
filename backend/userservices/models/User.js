const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,

    unique: true,
    trim: true,
  },
  email: {
    type: String,
  
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    
  },
  role: {
    type: String,
    enum: ['principal', 'teacher', 'staff', 'student', 'guardian'],
    
  },
  profile: {
    fullName: { type: String, required: true },
    fullNameBangla: { type: String },
    phone: { type: String },
    address: { type: String }
  },
  profileModel: {
    type: String,
    enum: ['Teacher', 'Student']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: { type: Boolean, default: false },
  passwordChangedAt: Date,
  permissions: [{
    type: String
  }]
}, {
  timestamps: true
});

// Simple password comparison method (no hashing)
userSchema.methods.correctPassword = async function (candidatePassword) {
  // In a real app, use bcrypt.compare
  return candidatePassword === this.password;
};


userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);