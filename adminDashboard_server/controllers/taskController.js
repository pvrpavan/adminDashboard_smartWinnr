const Task = require('../models/Task');
const User = require('../models/User');

// Get all task templates (admin)
const getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category || '';
    const isActive = req.query.isActive;

    const query = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      tasks,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new task template (admin)
const createTask = async (req, res) => {
  try {
    const { title, description, xpReward, category, difficulty, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      xpReward: xpReward || 10,
      category: category || 'daily',
      difficulty: difficulty || 'easy',
      assignedTo: assignedTo || 'all',
      createdBy: req.user._id,
    });

    await task.populate('createdBy', 'name email');

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a task template (admin)
const updateTask = async (req, res) => {
  try {
    const { title, description, xpReward, category, difficulty, isActive, assignedTo } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (xpReward !== undefined) task.xpReward = xpReward;
    if (category !== undefined) task.category = category;
    if (difficulty !== undefined) task.difficulty = difficulty;
    if (isActive !== undefined) task.isActive = isActive;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    const updatedTask = await task.save();
    await updatedTask.populate('createdBy', 'name email');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a task template (admin)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Assign a task to a specific user or all users (admin)
const assignTask = async (req, res) => {
  try {
    const { taskId, userId } = req.body;

    const taskTemplate = await Task.findById(taskId);
    if (!taskTemplate) {
      return res.status(404).json({ message: 'Task template not found' });
    }

    const taskData = {
      taskId: taskTemplate._id.toString(),
      title: taskTemplate.title,
      description: taskTemplate.description,
      xpReward: taskTemplate.xpReward,
      category: taskTemplate.category,
      completed: false,
      completedAt: null,
    };

    if (userId) {
      // Assign to specific user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if task already assigned
      const alreadyAssigned = user.tasks.find((t) => t.taskId === taskData.taskId && !t.completed);
      if (alreadyAssigned) {
        return res.status(400).json({ message: 'Task already assigned to this user' });
      }

      user.tasks.push(taskData);
      user.activityLog.push({
        action: 'task_assigned',
        description: `New task assigned: ${taskTemplate.title}`,
        xpEarned: 0,
        timestamp: new Date(),
      });
      await user.save();

      res.json({ message: 'Task assigned successfully', assignedCount: 1 });
    } else {
      // Assign to all eligible users
      const roleFilter = {};
      if (taskTemplate.assignedTo !== 'all') {
        roleFilter.role = taskTemplate.assignedTo;
      }

      const users = await User.find({ status: 'active', ...roleFilter });
      let assignedCount = 0;

      for (const user of users) {
        const alreadyAssigned = user.tasks.find((t) => t.taskId === taskData.taskId && !t.completed);
        if (!alreadyAssigned) {
          user.tasks.push({ ...taskData });
          user.activityLog.push({
            action: 'task_assigned',
            description: `New task assigned: ${taskTemplate.title}`,
            xpEarned: 0,
            timestamp: new Date(),
          });
          await user.save();
          assignedCount++;
        }
      }

      res.json({ message: `Task assigned to ${assignedCount} users`, assignedCount });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get task statistics (admin)
const getTaskStats = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const activeTasks = await Task.countDocuments({ isActive: true });
    const tasksByCategory = await Task.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const tasksByDifficulty = await Task.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    ]);

    res.json({
      totalTasks,
      activeTasks,
      inactiveTasks: totalTasks - activeTasks,
      tasksByCategory,
      tasksByDifficulty,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, assignTask, getTaskStats };
