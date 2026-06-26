const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50,
    validate: [
      {
        validator: function(val) {
          return !/^\d/.test(val);
        },
        message: 'Name cannot start with a number'
      },
      {
        validator: function(val) {
          return !/^\d+$/.test(val.replace(/\s/g, ''));
        },
        message: 'Name cannot contain only numbers'
      }
    ]
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    validate: {
      validator: function(val) {
        if (typeof this.isModified === 'function' && !this.isModified('password')) {
          return true;
        }
        return validator.isStrongPassword(val, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        });
      },
      message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    },
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'mentor', 'admin'],
    default: 'student'
  },
  avatar: String,
  college: String,
  batch: String,
  phase: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  preferences: {
    theme: { type: String, enum: ['dark', 'light', 'system'], default: 'system' },
    explainMode: { type: String, enum: ['beginner', 'intermediate', 'detailed'], default: 'intermediate' },
    notifications: { type: Boolean, default: true }
  },
  stats: {
    queriesRaised: { type: Number, default: 0 },
    answersGiven: { type: Number, default: 0 },
    bookmarks: { type: Number, default: 0 },
    reputation: { type: Number, default: 0 }
  },
  searchHistory: [{
    query: String,
    timestamp: { type: Date, default: Date.now }
  }],
  bookmarkedQueries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Query' }],
  isActive: { type: Boolean, default: true },
  lastSeen: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
