// Package details page functionality
let currentPackage = null;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const packageId = urlParams.get('id');

  if (!packageId) {
    showAlert('Package not found', 'error');
    setTimeout(() => window.location.href = 'packages.html', 2000);
    return;
  }

  await loadPackageDetails(packageId);
  setupBookingForm();
});

async function loadPackageDetails(packageId) {
  try {
    showLoading();
    const response = await ApiService.get(API_ENDPOINTS.package(packageId));
    currentPackage = response.data;
    displayPackageDetails(currentPackage);
  } catch (error) {
    console.error('Error loading package:', error);
    showAlert('Failed to load package details', 'error');
    setTimeout(() => window.location.href = 'packages.html', 2000);
  } finally {
    hideLoading();
  }
}

function displayPackageDetails(pkg) {
  const container = document.getElementById('package-details');
  
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
      <div>
        <img src="${pkg.image_url || 'https://via.placeholder.com/600x400'}" 
             alt="${pkg.title}" 
             style="width: 100%; border-radius: 15px;">
      </div>
      <div>
        <h1>${pkg.title}</h1>
        <p style="font-size: 1.1rem; color: #666; margin-top: 1rem;">
          📍 ${pkg.destination_name}, ${pkg.country}
        </p>
        <div style="display: flex; gap: 2rem; margin-top: 1rem;">
          <span>⏱️ ${pkg.duration_days} Days / ${pkg.duration_nights} Nights</span>
          <span>👥 Max ${pkg.max_people} People</span>
        </div>
        ${pkg.avg_rating > 0 ? `
          <div style="margin-top: 1rem;">
            ⭐ ${parseFloat(pkg.avg_rating).toFixed(1)} / 5.0 (${pkg.review_count} reviews)
          </div>
        ` : ''}
        <div class="card-price" style="margin-top: 1.5rem;">
          $${pkg.price} <span style="font-size: 1rem; font-weight: normal;">per person</span>
        </div>
        <button onclick="openBookingModal()" class="btn btn-primary" style="margin-top: 1.5rem; width: 100%;">
          Book Now
        </button>
      </div>
    </div>

    <div class="card" style="padding: 2rem; margin-bottom: 2rem;">
      <h2>Description</h2>
      <p style="line-height: 1.8;">${pkg.description}</p>
    </div>

    <div class="card" style="padding: 2rem; margin-bottom: 2rem;">
      <h2>Itinerary</h2>
      <pre style="white-space: pre-wrap; line-height: 1.8; font-family: inherit;">${pkg.itinerary}</pre>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
      <div class="card" style="padding: 2rem;">
        <h2>Included Services</h2>
        <p style="line-height: 1.8;">${pkg.included_services}</p>
      </div>
      <div class="card" style="padding: 2rem;">
        <h2>Excluded Services</h2>
        <p style="line-height: 1.8;">${pkg.excluded_services}</p>
      </div>
    </div>

    ${pkg.reviews && pkg.reviews.length > 0 ? `
      <div class="card" style="padding: 2rem;">
        <h2>Customer Reviews</h2>
        ${pkg.reviews.map(review => `
          <div style="border-bottom: 1px solid #e0e0e0; padding: 1rem 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong>${review.full_name}</strong>
              <span>⭐ ${review.rating}/5</span>
            </div>
            <p style="margin-top: 0.5rem; color: #666;">${review.comment}</p>
            <small style="color: #999;">
              ${new Date(review.created_at).toLocaleDateString()}
            </small>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;

  // Set min date for travel date input
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('travel-date').min = today;
  
  // Set max people
  document.getElementById('num-people').max = pkg.max_people;
}

function setupBookingForm() {
  const numPeopleInput = document.getElementById('num-people');
  numPeopleInput.addEventListener('input', updateBookingSummary);
  
  document.getElementById('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitBooking();
  });
}

function updateBookingSummary() {
  if (!currentPackage) return;
  
  const numPeople = parseInt(document.getElementById('num-people').value) || 1;
  const totalPrice = currentPackage.price * numPeople;
  
  document.getElementById('summary-package').textContent = `Package: ${currentPackage.title}`;
  document.getElementById('summary-people').textContent = `Number of People: ${numPeople}`;
  document.getElementById('summary-total').textContent = `Total: $${totalPrice.toFixed(2)}`;
}

function openBookingModal() {
  if (!AuthService.isAuthenticated()) {
    showAlert('Please login to book this package', 'warning');
    setTimeout(() => window.location.href = 'login.html', 1500);
    return;
  }
  
  updateBookingSummary();
  document.getElementById('booking-modal').classList.add('active');
}

function closeBookingModal() {
  document.getElementById('booking-modal').classList.remove('active');
}

async function submitBooking() {
  const bookingData = {
    package_id: currentPackage.package_id,
    travel_date: document.getElementById('travel-date').value,
    num_people: parseInt(document.getElementById('num-people').value),
    special_requests: document.getElementById('special-requests').value
  };

  try {
    showLoading();
    await ApiService.post(API_ENDPOINTS.bookings, bookingData);
    showAlert('Booking successful! Redirecting to your bookings...', 'success');
    
    setTimeout(() => {
      window.location.href = 'bookings.html';
    }, 2000);
  } catch (error) {
    showAlert(error.message || 'Booking failed', 'error');
    hideLoading();
  }
}