const Analytics = require('../models/Analytics');
const Sales = require('../models/Sales');
const User = require('../models/User');

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalSales = await Sales.countDocuments();
    const totalRevenue = await Sales.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newSignups = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    const pendingOrders = await Sales.countDocuments({ status: 'pending' });

    res.json({
      totalUsers,
      activeUsers,
      totalSales,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      newSignups,
      pendingOrders,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAnalyticsData = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await Analytics.find({ date: { $gte: startDate } }).sort({ date: 1 });

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSalesData = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const salesByCategory = await Sales.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const salesByDate = await Sales.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const salesByStatus = await Sales.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const recentSales = await Sales.find()
      .sort({ date: -1 })
      .limit(10);

    res.json({
      salesByCategory,
      salesByDate,
      salesByStatus,
      recentSales,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getRevenueData = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const revenueByMonth = await Sales.aggregate([
      { $match: { date: { $gte: startDate }, status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalRevenue: { $sum: '$amount' },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json(revenueByMonth);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDashboardStats, getAnalyticsData, getSalesData, getRevenueData };
