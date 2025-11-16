const db = require('../config/database');

// @desc    Get all packages
// @route   GET /api/packages
// @access  Public
exports.getPackages = async (req, res) => {
  try {
    const { destination, minPrice, maxPrice, available } = req.query;
    let query = `
      SELECT p.*, d.name as destination_name, d.country,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(DISTINCT r.review_id) as review_count
      FROM packages p
      LEFT JOIN destinations d ON p.destination_id = d.destination_id
      LEFT JOIN reviews r ON p.package_id = r.package_id
      WHERE 1=1
    `;
    const params = [];

    if (destination) {
      query += ' AND d.name LIKE ?';
      params.push(`%${destination}%`);
    }

    if (minPrice) {
      query += ' AND p.price >= ?';
      params.push(minPrice);
    }

    if (maxPrice) {
      query += ' AND p.price <= ?';
      params.push(maxPrice);
    }

    if (available !== undefined) {
      query += ' AND p.available = ?';
      params.push(available === 'true' ? 1 : 0);
    }

    query += ' GROUP BY p.package_id ORDER BY p.created_at DESC';

    const [packages] = await db.query(query, params);

    res.json({
      success: true,
      count: packages.length,
      data: packages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single package
// @route   GET /api/packages/:id
// @access  Public
exports.getPackage = async (req, res) => {
  try {
    const [packages] = await db.query(
      `SELECT p.*, d.name as destination_name, d.country, d.description as destination_description,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(DISTINCT r.review_id) as review_count
      FROM packages p
      LEFT JOIN destinations d ON p.destination_id = d.destination_id
      LEFT JOIN reviews r ON p.package_id = r.package_id
      WHERE p.package_id = ?
      GROUP BY p.package_id`,
      [req.params.id]
    );

    if (packages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    // Get reviews for this package
    const [reviews] = await db.query(
      `SELECT r.*, u.username, u.full_name
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.package_id = ?
      ORDER BY r.created_at DESC`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...packages[0],
        reviews
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create package
// @route   POST /api/packages
// @access  Private/Admin
exports.createPackage = async (req, res) => {
  try {
    const {
      destination_id,
      title,
      description,
      duration_days,
      duration_nights,
      price,
      max_people,
      included_services,
      excluded_services,
      itinerary,
      image_url
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO packages 
      (destination_id, title, description, duration_days, duration_nights, 
      price, max_people, included_services, excluded_services, itinerary, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [destination_id, title, description, duration_days, duration_nights,
       price, max_people, included_services, excluded_services, itinerary, image_url]
    );

    const [newPackage] = await db.query(
      'SELECT * FROM packages WHERE package_id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: newPackage[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update package
// @route   PUT /api/packages/:id
// @access  Private/Admin
exports.updatePackage = async (req, res) => {
  try {
    const [existing] = await db.query(
      'SELECT * FROM packages WHERE package_id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    const {
      destination_id,
      title,
      description,
      duration_days,
      duration_nights,
      price,
      max_people,
      included_services,
      excluded_services,
      itinerary,
      image_url,
      available
    } = req.body;

    await db.query(
      `UPDATE packages SET
      destination_id = COALESCE(?, destination_id),
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      duration_days = COALESCE(?, duration_days),
      duration_nights = COALESCE(?, duration_nights),
      price = COALESCE(?, price),
      max_people = COALESCE(?, max_people),
      included_services = COALESCE(?, included_services),
      excluded_services = COALESCE(?, excluded_services),
      itinerary = COALESCE(?, itinerary),
      image_url = COALESCE(?, image_url),
      available = COALESCE(?, available)
      WHERE package_id = ?`,
      [destination_id, title, description, duration_days, duration_nights,
       price, max_people, included_services, excluded_services, itinerary,
       image_url, available, req.params.id]
    );

    const [updated] = await db.query(
      'SELECT * FROM packages WHERE package_id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Package updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete package
// @route   DELETE /api/packages/:id
// @access  Private/Admin
exports.deletePackage = async (req, res) => {
  try {
    const [existing] = await db.query(
      'SELECT * FROM packages WHERE package_id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    await db.query('DELETE FROM packages WHERE package_id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};