const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const taskSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  xpReward: { type: Number, default: 10 },
  category: {
    type: String,
    enum: ['onboarding', 'daily', 'weekly', 'challenge', 'milestone'],
    default: 'daily',
  },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
});

const achievementSchema = new mongoose.Schema({
  achievementId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'star' },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common',
  },
  unlockedAt: { type: Date, default: null },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'user'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    avatar: {
      type: String,
      default: '',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    // Gamification fields
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    tasksCompleted: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
    tasks: [taskSchema],
    achievements: [achievementSchema],
    activityLog: [
      {
        action: { type: String, required: true },
        description: { type: String, default: '' },
        xpEarned: { type: Number, default: 0 },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Calculate level from XP
userSchema.methods.calculateLevel = function () {
  let xpRemaining = this.xp;
  let level = 1;
  while (xpRemaining >= level * 100) {
    xpRemaining -= level * 100;
    level++;
  }
  this.level = level;
  return level;
};

// Get XP needed for next level
userSchema.methods.getXpForNextLevel = function () {
  return this.level * 100;
};

// Get current XP progress within current level
userSchema.methods.getCurrentLevelXp = function () {
  let xpRemaining = this.xp;
  let level = 1;
  while (xpRemaining >= level * 100) {
    xpRemaining -= level * 100;
    level++;
  }
  return xpRemaining;
};

module.exports = mongoose.model('User', userSchema);
