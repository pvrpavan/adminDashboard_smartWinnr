const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAnalyticsData,
  getSalesData,
  getRevenueData,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', authorize('admin', 'manager'), getDashboardStats);
router.get('/data', authorize('admin', 'manager'), getAnalyticsData);
router.get('/sales', authorize('admin', 'manager'), getSalesData);
router.get('/revenue', authorize('admin', 'manager'), getRevenueData);

module.exports = router;
