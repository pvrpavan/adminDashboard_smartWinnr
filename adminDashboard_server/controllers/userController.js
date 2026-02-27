const User = require('../models/User');

const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const status = req.query.status || '';

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;
    if (status) query.status = status;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (status) user.status = status;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const inactiveUsers = await User.countDocuments({ status: 'inactive' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });
    const admins = await User.countDocuments({ role: 'admin' });
    const managers = await User.countDocuments({ role: 'manager' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      admins,
      managers,
      regularUsers,
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user's dashboard data (gamification)
const getMyDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentLevelXp = user.getCurrentLevelXp();
    const xpForNextLevel = user.getXpForNextLevel();

    // Get leaderboard (top 10 users by XP)
    const leaderboard = await User.find({ status: 'active' })
      .select('name xp level tasksCompleted avatar')
      .sort({ xp: -1 })
      .limit(10);

    // Find user's rank
    const userRank = await User.countDocuments({
      status: 'active',
      xp: { $gt: user.xp },
    });

    res.json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        currentLevelXp,
        xpForNextLevel,
        tasksCompleted: user.tasksCompleted,
        streak: user.streak,
        longestStreak: user.longestStreak,
        tasks: user.tasks,
        achievements: user.achievements,
        activityLog: user.activityLog.slice(-20).reverse(),
        rank: userRank + 1,
      },
      leaderboard,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Complete a task
const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const task = user.tasks.find((t) => t.taskId === taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.completed) {
      return res.status(400).json({ message: 'Task already completed' });
    }

    // Complete the task
    task.completed = true;
    task.completedAt = new Date();

    // Award XP
    user.xp += task.xpReward;
    user.tasksCompleted += 1;

    // Recalculate level
    user.calculateLevel();

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
    }

    if (!lastActive || today.getTime() !== lastActive.getTime()) {
      if (lastActive) {
        const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          user.streak += 1;
        } else if (diffDays > 1) {
          user.streak = 1;
        }
      } else {
        user.streak = 1;
      }
      user.lastActiveDate = today;
    }

    if (user.streak > user.longestStreak) {
      user.longestStreak = user.streak;
    }

    // Add activity log
    user.activityLog.push({
      action: 'task_completed',
      description: `Completed: ${task.title}`,
      xpEarned: task.xpReward,
      timestamp: new Date(),
    });

    // Check for achievement unlocks
    const achievementChecks = [
      { id: 'first_task', condition: user.tasksCompleted >= 1 },
      { id: 'task_5', condition: user.tasksCompleted >= 5 },
      { id: 'task_10', condition: user.tasksCompleted >= 10 },
      { id: 'task_25', condition: user.tasksCompleted >= 25 },
      { id: 'streak_3', condition: user.streak >= 3 },
      { id: 'streak_7', condition: user.streak >= 7 },
      { id: 'level_5', condition: user.level >= 5 },
      { id: 'level_10', condition: user.level >= 10 },
      { id: 'xp_500', condition: user.xp >= 500 },
      { id: 'xp_1000', condition: user.xp >= 1000 },
    ];

    for (const check of achievementChecks) {
      const achievement = user.achievements.find((a) => a.achievementId === check.id);
      if (achievement && !achievement.unlockedAt && check.condition) {
        achievement.unlockedAt = new Date();
        user.xp += 50; // Bonus XP for unlocking achievement
        user.calculateLevel();
        user.activityLog.push({
          action: 'achievement_unlocked',
          description: `Achievement unlocked: ${achievement.title}`,
          xpEarned: 50,
          timestamp: new Date(),
        });
      }
    }

    await user.save();

    const currentLevelXp = user.getCurrentLevelXp();
    const xpForNextLevel = user.getXpForNextLevel();

    res.json({
      message: 'Task completed successfully!',
      xpEarned: task.xpReward,
      user: {
        xp: user.xp,
        level: user.level,
        currentLevelXp,
        xpForNextLevel,
        tasksCompleted: user.tasksCompleted,
        streak: user.streak,
        tasks: user.tasks,
        achievements: user.achievements,
        activityLog: user.activityLog.slice(-20).reverse(),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser, getUserStats, getMyDashboard, completeTask };
