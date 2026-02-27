const mongoose = require('mongoose');

const taskTemplateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    xpReward: {
      type: Number,
      default: 10,
      min: 1,
    },
    category: {
      type: String,
      enum: ['onboarding', 'daily', 'weekly', 'challenge', 'milestone'],
      default: 'daily',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert'],
      default: 'easy',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    assignedTo: {
      type: String,
      enum: ['all', 'user', 'manager', 'admin'],
      default: 'all',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskTemplateSchema);
