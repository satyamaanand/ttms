// Bookings page functionality
document.addEventListener('DOMContentLoaded', async () => {
  if (!AuthService.requireAuth()) return;
  await loadBookings();
  setupReviewForm();
});

async function loadBookings() {
  try {
    showLoading();
    const response = await ApiService.get(API_ENDPOINTS.myBookings);
    displayBookings(response.data);
  } catch (error) {
    console.error('Error loading bookings:', error);
    showAlert('Failed to load bookings', 'error');
  } finally {
    hideLoading();
  }
}

function displayBookings(bookings) {
  const container = document.getElementById('bookings-container');

  if (bookings.length === 0) {
    container.innerHTML = `
      <div class="card" style="padding: 3rem; text-align: center;">
        <h3>No bookings yet</h3>
        <p>Start exploring our amazing packages!</p>
        <a href="packages.html" class="btn btn-primary" style="margin-top: 1rem;">
          Browse Packages
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = bookings.map(booking => `
    <div class="card" style="padding: 1.5rem; margin-bottom: 1.5rem;">
      <div style="display: grid; grid-template-columns: 200px 1fr; gap: 1.5rem;">
        <img src="${booking.package_image || 'https://via.placeholder.com/200x150'}" 
             alt="${booking.package_title}" 
             style="width: 100%; border-radius: 10px;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <h3 style="margin-bottom: 0.5rem;">${booking.package_title}</h3>
              <p style="color: #666;">📍 ${booking.destination_name}, ${booking.country}</p>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-direction: column; align-items: flex-end;">
              <span class="badge badge-${booking.status}">${booking.status.toUpperCase()}</span>
              <span class="badge badge-${booking.payment_status}">${booking.payment_status.toUpperCase()}</span>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
            <div>
              <strong>Booking Date:</strong><br>
              ${new Date(booking.booking_date).toLocaleDateString()}
            </div>
            <div>
              <strong>Travel Date:</strong><br>
              ${new Date(booking.travel_date).toLocaleDateString()}
            </div>
            <div>
              <strong>Duration:</strong><br>
              ${booking.duration_days}D/${booking.duration_nights}N
            </div>
            <div>
              <strong>People:</strong><br>
              ${booking.num_people}
            </div>
            <div>
              <strong>Total Amount:</strong><br>
              <span style="font-size: 1.2rem; color: #667eea; font-weight: bold;">
                $${booking.total_amount}
              </span>
            </div>
          </div>

          ${booking.special_requests ? `
            <div style="margin-top: 1rem; padding: 0.75rem; background: #fff3cd; border-radius: 8px;">
              <strong>Special Requests:</strong> ${booking.special_requests}
            </div>
          ` : ''}

          <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            ${booking.status === 'pending' ? `
              <button onclick="cancelBooking(${booking.booking_id})" class="btn btn-danger">
                Cancel Booking
              </button>
            ` : ''}
            ${booking.status === 'completed' ? `
              <button onclick="openReviewModal(${booking.booking_id})" class="btn btn-primary">
                Write Review
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

async function cancelBooking(bookingId) {
  if (!confirm('Are you sure you want to cancel this booking?')) {
    return;
  }

  try {
    showLoading();
    await ApiService.put(API_ENDPOINTS.cancelBooking(bookingId), {});
    showAlert('Booking cancelled successfully', 'success');
    await loadBookings();
  } catch (error) {
    showAlert(error.message || 'Failed to cancel booking', 'error');
  } finally {
    hideLoading();
  }
}

function openReviewModal(bookingId) {
  document.getElementById('review-booking-id').value = bookingId;
  document.getElementById('review-modal').classList.add('active');
}

function closeReviewModal() {
  document.getElementById('review-modal').classList.remove('active');
  document.getElementById('review-form').reset();
}

function setupReviewForm() {
  document.getElementById('review-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const bookingId = document.getElementById('review-booking-id').value;
    const reviewData = {
      rating: parseInt(document.getElementById('review-rating').value),
      comment: document.getElementById('review-comment').value
    };

    try {
      showLoading();
      await ApiService.post(API_ENDPOINTS.addReview(bookingId), reviewData);
      showAlert('Review submitted successfully!', 'success');
      closeReviewModal();
      await loadBookings();
    } catch (error) {
      showAlert(error.message || 'Failed to submit review', 'error');
    } finally {
      hideLoading();
    }
  });
}