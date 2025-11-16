// routes/destinationRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get all destinations
router.get('/', async (req, res) => {
  try {
    const [destinations] = await db.query(
      `SELECT d.*, COUNT(p.package_id) as package_count
      FROM destinations d
      LEFT JOIN packages p ON d.destination_id = p.destination_id
      GROUP BY d.destination_id
      ORDER BY d.popular DESC, d.name ASC`
    );

    res.json({
      success: true,
      count: destinations.length,
      data: destinations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get single destination
router.get('/:id', async (req, res) => {
  try {
    const [destinations] = await db.query(
      'SELECT * FROM destinations WHERE destination_id = ?',
      [req.params.id]
    );

    if (destinations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Get packages for this destination
    const [packages] = await db.query(
      'SELECT * FROM packages WHERE destination_id = ? AND available = 1',
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...destinations[0],
        packages
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create destination (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, country, description, image_url, popular } = req.body;

    const [result] = await db.query(
      'INSERT INTO destinations (name, country, description, image_url, popular) VALUES (?, ?, ?, ?, ?)',
      [name, country, description, image_url, popular || false]
    );

    const [newDestination] = await db.query(
      'SELECT * FROM destinations WHERE destination_id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Destination created successfully',
      data: newDestination[0]
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