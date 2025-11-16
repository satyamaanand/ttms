const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get all users (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT user_id, username, email, full_name, phone, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { full_name, phone } = req.body;

    await db.query(
      'UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE user_id = ?',
      [full_name, phone, req.user.id]
    );

    const [updated] = await db.query(
      'SELECT user_id, username, email, full_name, phone, role FROM users WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;