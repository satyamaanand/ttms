// API Configuration
const API_URL = 'http://localhost:5000/api';

// API endpoints
const API_ENDPOINTS = {
  // Auth
  login: `${API_URL}/auth/login`,
  register: `${API_URL}/auth/register`,
  me: `${API_URL}/auth/me`,
  
  // Packages
  packages: `${API_URL}/packages`,
  package: (id) => `${API_URL}/packages/${id}`,
  
  // Bookings
  bookings: `${API_URL}/bookings`,
  myBookings: `${API_URL}/bookings/my-bookings`,
  booking: (id) => `${API_URL}/bookings/${id}`,
  cancelBooking: (id) => `${API_URL}/bookings/${id}/cancel`,
  updateBookingStatus: (id) => `${API_URL}/bookings/${id}/status`,
  addReview: (id) => `${API_URL}/bookings/${id}/review`,
  
  // Users
  users: `${API_URL}/users`,
  updateProfile: `${API_URL}/users/profile`,
  
  // Destinations
  destinations: `${API_URL}/destinations`,
  destination: (id) => `${API_URL}/destinations/${id}`
};