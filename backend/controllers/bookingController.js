const db = require('../config/database');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { package_id, travel_date, num_people, special_requests } = req.body;
    const user_id = req.user.id;

    // Get package details
    const [packages] = await db.query(
      'SELECT * FROM packages WHERE package_id = ? AND available = 1',
      [package_id]
    );

    if (packages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Package not found or not available'
      });
    }

    const pkg = packages[0];

    // Check if number of people exceeds max
    if (num_people > pkg.max_people) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${pkg.max_people} people allowed for this package`
      });
    }

    // Calculate total amount
    const total_amount = pkg.price * num_people;

    // Create booking
    const [result] = await db.query(
      `INSERT INTO bookings 
      (user_id, package_id, booking_date, travel_date, num_people, total_amount, special_requests)
      VALUES (?, ?, CURDATE(), ?, ?, ?, ?)`,
      [user_id, package_id, travel_date, num_people, total_amount, special_requests]
    );

    const [newBooking] = await db.query(
      `SELECT b.*, p.title as package_title, p.image_url as package_image,
      d.name as destination_name
      FROM bookings b
      JOIN packages p ON b.package_id = p.package_id
      JOIN destinations d ON p.destination_id = d.destination_id
      WHERE b.booking_id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: newBooking[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const [bookings] = await db.query(
      `SELECT b.*, p.title as package_title, p.image_url as package_image,
      p.duration_days, p.duration_nights,
      d.name as destination_name, d.country
      FROM bookings b
      JOIN packages p ON b.package_id = p.package_id
      JOIN destinations d ON p.destination_id = d.destination_id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const { status, payment_status } = req.query;
    let query = `
      SELECT b.*, 
      u.username, u.email, u.full_name, u.phone,
      p.title as package_title,
      d.name as destination_name
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN packages p ON b.package_id = p.package_id
      JOIN destinations d ON p.destination_id = d.destination_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    if (payment_status) {
      query += ' AND b.payment_status = ?';
      params.push(payment_status);
    }

    query += ' ORDER BY b.created_at DESC';

    const [bookings] = await db.query(query, params);

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const [bookings] = await db.query(
      `SELECT b.*, 
      u.username, u.email, u.full_name, u.phone,
      p.title as package_title, p.description as package_description,
      p.duration_days, p.duration_nights, p.included_services, p.image_url as package_image,
      d.name as destination_name, d.country
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN packages p ON b.package_id = p.package_id
      JOIN destinations d ON p.destination_id = d.destination_id
      WHERE b.booking_id = ?`,
      [req.params.id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookings[0];

    // Check authorization
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, payment_status } = req.body;

    const [existing] = await db.query(
      'SELECT * FROM bookings WHERE booking_id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await db.query(
      `UPDATE bookings SET
      status = COALESCE(?, status),
      payment_status = COALESCE(?, payment_status)
      WHERE booking_id = ?`,
      [status, payment_status, req.params.id]
    );

    const [updated] = await db.query(
      'SELECT * FROM bookings WHERE booking_id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Booking updated successfully',
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

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const [bookings] = await db.query(
      'SELECT * FROM bookings WHERE booking_id = ?',
      [req.params.id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookings[0];

    // Check authorization
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking already cancelled'
      });
    }

    await db.query(
      'UPDATE bookings SET status = ? WHERE booking_id = ?',
      ['cancelled', req.params.id]
    );

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add review
// @route   POST /api/bookings/:id/review
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const booking_id = req.params.id;

    // Check if booking exists and belongs to user
    const [bookings] = await db.query(
      'SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?',
      [booking_id, req.user.id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookings[0];

    // Check if already reviewed
    const [existingReview] = await db.query(
      'SELECT * FROM reviews WHERE booking_id = ?',
      [booking_id]
    );

    if (existingReview.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Review already submitted for this booking'
      });
    }

    // Add review
    await db.query(
      'INSERT INTO reviews (user_id, package_id, booking_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, booking.package_id, booking_id, rating, comment]
    );

    res.status(201).json({
      success: true,
      message: 'Review added successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};