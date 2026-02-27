const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Analytics = require('./models/Analytics');
const Sales = require('./models/Sales');

require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/adminDashboard';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Analytics.deleteMany({});
    await Sales.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = [
      { name: 'Admin User', email: 'admin@admin.com', password: 'admin123', role: 'admin', status: 'active' },
      { name: 'Sarah Manager', email: 'sarah@example.com', password: 'password123', role: 'manager', status: 'active' },
      { name: 'John Smith', email: 'john@example.com', password: 'password123', role: 'user', status: 'active' },
      { name: 'Emily Davis', email: 'emily@example.com', password: 'password123', role: 'user', status: 'active' },
      { name: 'Michael Brown', email: 'michael@example.com', password: 'password123', role: 'user', status: 'inactive' },
      { name: 'Jessica Wilson', email: 'jessica@example.com', password: 'password123', role: 'user', status: 'active' },
      { name: 'David Lee', email: 'david@example.com', password: 'password123', role: 'manager', status: 'active' },
      { name: 'Amanda Taylor', email: 'amanda@example.com', password: 'password123', role: 'user', status: 'suspended' },
      { name: 'Robert Johnson', email: 'robert@example.com', password: 'password123', role: 'user', status: 'active' },
      { name: 'Lisa Anderson', email: 'lisa@example.com', password: 'password123', role: 'user', status: 'active' },
      { name: 'Chris Martin', email: 'chris@example.com', password: 'password123', role: 'user', status: 'active' },
      { name: 'Nancy White', email: 'nancy@example.com', password: 'password123', role: 'user', status: 'inactive' },
      { name: 'Kevin Harris', email: 'kevin@example.com', password: 'password123', role: 'user', status: 'active' },
      { name: 'Karen Clark', email: 'karen@example.com', password: 'password123', role: 'manager', status: 'active' },
      { name: 'James Lewis', email: 'james@example.com', password: 'password123', role: 'user', status: 'active' },
    ];

    // Default tasks for every user
    const defaultTasks = [
      { taskId: 'complete_profile', title: 'Complete Your Profile', description: 'Fill in all your profile details', xpReward: 25, category: 'onboarding' },
      { taskId: 'first_login', title: 'First Login', description: 'Log in to the platform for the first time', xpReward: 10, category: 'onboarding' },
      { taskId: 'explore_dashboard', title: 'Explore Dashboard', description: 'Visit the dashboard and review your stats', xpReward: 15, category: 'onboarding' },
      { taskId: 'view_settings', title: 'Check Settings', description: 'Visit the settings page and review your preferences', xpReward: 10, category: 'onboarding' },
      { taskId: 'daily_checkin', title: 'Daily Check-in', description: 'Log in today to keep your streak going', xpReward: 5, category: 'daily' },
      { taskId: 'review_analytics', title: 'Review Analytics', description: 'Check the analytics reports', xpReward: 20, category: 'weekly' },
      { taskId: 'update_profile_pic', title: 'Update Avatar', description: 'Upload or update your profile picture', xpReward: 15, category: 'onboarding' },
      { taskId: 'invite_colleague', title: 'Invite a Colleague', description: 'Send an invitation to a team member', xpReward: 30, category: 'challenge' },
      { taskId: 'complete_5_tasks', title: 'Task Master', description: 'Complete 5 different tasks', xpReward: 50, category: 'milestone' },
      { taskId: 'reach_level_3', title: 'Level Up Pro', description: 'Reach level 3 in the gamification system', xpReward: 75, category: 'milestone' },
    ];

    // Default achievements for every user
    const defaultAchievements = [
      { achievementId: 'first_task', title: 'Getting Started', description: 'Complete your first task', icon: 'rocket', rarity: 'common' },
      { achievementId: 'task_5', title: 'Task Warrior', description: 'Complete 5 tasks', icon: 'sword', rarity: 'common' },
      { achievementId: 'task_10', title: 'Task Champion', description: 'Complete 10 tasks', icon: 'trophy', rarity: 'rare' },
      { achievementId: 'task_25', title: 'Task Legend', description: 'Complete 25 tasks', icon: 'crown', rarity: 'epic' },
      { achievementId: 'streak_3', title: 'On Fire', description: 'Maintain a 3-day streak', icon: 'fire', rarity: 'common' },
      { achievementId: 'streak_7', title: 'Unstoppable', description: 'Maintain a 7-day streak', icon: 'lightning', rarity: 'rare' },
      { achievementId: 'level_5', title: 'Rising Star', description: 'Reach level 5', icon: 'star', rarity: 'rare' },
      { achievementId: 'level_10', title: 'Elite Member', description: 'Reach level 10', icon: 'diamond', rarity: 'legendary' },
      { achievementId: 'xp_500', title: 'XP Hunter', description: 'Earn 500 XP', icon: 'zap', rarity: 'common' },
      { achievementId: 'xp_1000', title: 'XP Master', description: 'Earn 1000 XP', icon: 'gem', rarity: 'epic' },
    ];

    await User.insertMany(users.map((u, index) => {
      // Give some users pre-completed tasks and XP for realistic data
      const completedCount = Math.floor(Math.random() * 6);
      const xp = completedCount * 20 + Math.floor(Math.random() * 50);
      let level = 1;
      let xpCheck = xp;
      while (xpCheck >= level * 100) {
        xpCheck -= level * 100;
        level++;
      }

      const userTasks = defaultTasks.map((t, i) => ({
        ...t,
        completed: i < completedCount,
        completedAt: i < completedCount ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
      }));

      const userAchievements = defaultAchievements.map((a) => ({
        ...a,
        unlockedAt: (a.achievementId === 'first_task' && completedCount >= 1) ||
                    (a.achievementId === 'task_5' && completedCount >= 5)
          ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000)
          : null,
      }));

      return {
        ...u,
        password: bcrypt.hashSync(u.password, 10),
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        xp,
        level,
        tasksCompleted: completedCount,
        streak: Math.floor(Math.random() * 5) + 1,
        longestStreak: Math.floor(Math.random() * 10) + 1,
        lastActiveDate: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000),
        tasks: userTasks,
        achievements: userAchievements,
        activityLog: Array.from({ length: Math.min(completedCount, 5) }, (_, i) => ({
          action: 'task_completed',
          description: `Completed: ${defaultTasks[i].title}`,
          xpEarned: defaultTasks[i].xpReward,
          timestamp: new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000),
        })),
      };
    }));
    console.log('Users seeded with gamification data');

    // Create analytics data for last 30 days
    const analyticsData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      analyticsData.push({
        date,
        activeUsers: Math.floor(Math.random() * 500) + 200,
        newSignups: Math.floor(Math.random() * 50) + 10,
        totalSales: Math.floor(Math.random() * 100) + 20,
        revenue: Math.floor(Math.random() * 15000) + 5000,
        pageViews: Math.floor(Math.random() * 5000) + 1000,
        bounceRate: Math.floor(Math.random() * 30) + 20,
        avgSessionDuration: Math.floor(Math.random() * 300) + 60,
        conversionRate: parseFloat((Math.random() * 5 + 1).toFixed(2)),
      });
    }
    await Analytics.insertMany(analyticsData);
    console.log('Analytics data seeded');

    // Create sales data
    const categories = ['Electronics', 'Clothing', 'Food', 'Services', 'Software', 'Other'];
    const products = {
      Electronics: ['Laptop', 'Phone', 'Tablet', 'Headphones', 'Monitor'],
      Clothing: ['T-Shirt', 'Jeans', 'Jacket', 'Shoes', 'Hat'],
      Food: ['Premium Box', 'Organic Pack', 'Snack Bundle', 'Meal Kit', 'Drink Pack'],
      Services: ['Consultation', 'Support Plan', 'Training', 'Audit', 'Setup'],
      Software: ['License', 'Subscription', 'Plugin', 'Theme', 'API Access'],
      Other: ['Gift Card', 'Accessories', 'Merch', 'Books', 'Donations'],
    };
    const statuses = ['completed', 'completed', 'completed', 'pending', 'refunded', 'cancelled'];
    const customerNames = ['Acme Corp', 'TechStart Inc', 'Global Foods', 'Fashion Hub', 'DataPro', 'SmartTech', 'InnovateCo', 'BlueSky Ltd', 'GreenWorld', 'SwiftSolutions'];

    const salesData = [];
    for (let i = 0; i < 150; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const productList = products[category];
      const product = productList[Math.floor(Math.random() * productList.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 90));

      salesData.push({
        product,
        category,
        amount: parseFloat((Math.random() * 2000 + 50).toFixed(2)),
        quantity: Math.floor(Math.random() * 10) + 1,
        customer: customerNames[Math.floor(Math.random() * customerNames.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        date,
      });
    }
    await Sales.insertMany(salesData);
    console.log('Sales data seeded');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
