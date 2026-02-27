const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active. Contact admin.' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
        xp: user.xp,
        level: user.level,
        tasksCompleted: user.tasksCompleted,
        streak: user.streak,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
    });

    // Assign active tasks from Task templates to new user
    try {
      const Task = require('../models/Task');
      const activeTasks = await Task.find({ isActive: true });
      const userRole = user.role;

      for (const taskTemplate of activeTasks) {
        if (taskTemplate.assignedTo === 'all' || taskTemplate.assignedTo === userRole) {
          user.tasks.push({
            taskId: taskTemplate._id.toString(),
            title: taskTemplate.title,
            description: taskTemplate.description,
            xpReward: taskTemplate.xpReward,
            category: taskTemplate.category,
            completed: false,
            completedAt: null,
          });
        }
      }

      // Add default achievements
      const defaultAchievements = [
        { achievementId: 'first_task', title: 'First Steps', description: 'Complete your first task', icon: 'rocket', rarity: 'common' },
        { achievementId: 'task_5', title: 'Getting Started', description: 'Complete 5 tasks', icon: 'sword', rarity: 'common' },
        { achievementId: 'task_10', title: 'Task Master', description: 'Complete 10 tasks', icon: 'trophy', rarity: 'rare' },
        { achievementId: 'task_25', title: 'Overachiever', description: 'Complete 25 tasks', icon: 'crown', rarity: 'epic' },
        { achievementId: 'streak_3', title: 'On Fire', description: 'Maintain a 3-day streak', icon: 'fire', rarity: 'common' },
        { achievementId: 'streak_7', title: 'Unstoppable', description: 'Maintain a 7-day streak', icon: 'lightning', rarity: 'rare' },
        { achievementId: 'level_5', title: 'Rising Star', description: 'Reach level 5', icon: 'star', rarity: 'rare' },
        { achievementId: 'level_10', title: 'Elite Player', description: 'Reach level 10', icon: 'diamond', rarity: 'epic' },
        { achievementId: 'xp_500', title: 'XP Hunter', description: 'Earn 500 XP', icon: 'zap', rarity: 'rare' },
        { achievementId: 'xp_1000', title: 'XP Legend', description: 'Earn 1000 XP', icon: 'gem', rarity: 'legendary' },
      ];
      user.achievements = defaultAchievements;

      user.activityLog.push({
        action: 'account_created',
        description: 'Welcome! Your account has been created.',
        xpEarned: 0,
        timestamp: new Date(),
      });

      await user.save();
    } catch (taskError) {
      // Non-critical: user is still created even if task assignment fails
      console.error('Error assigning default tasks:', taskError.message);
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        xp: user.xp,
        level: user.level,
        tasksCompleted: user.tasksCompleted,
        streak: user.streak,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { login, register, getMe };
