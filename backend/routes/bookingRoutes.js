const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  addReview
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorize('admin'), getAllBookings)
  .post(protect, createBooking);

router.get('/my-bookings', protect, getMyBookings);

router.route('/:id')
  .get(protect, getBooking);

router.put('/:id/status', protect, authorize('admin'), updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);
router.post('/:id/review', protect, addReview);

module.exports = router;