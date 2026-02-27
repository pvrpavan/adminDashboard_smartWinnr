const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  getMyDashboard,
  completeTask,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Gamification routes (available to all authenticated users)
router.get('/me/dashboard', getMyDashboard);
router.post('/me/tasks/:taskId/complete', completeTask);

router.get('/stats', authorize('admin', 'manager'), getUserStats);
router.get('/', authorize('admin', 'manager'), getUsers);
router.get('/:id', authorize('admin', 'manager'), getUserById);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
