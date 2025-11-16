// Admin dashboard functionality
let bookings = [];
let packages = [];
let users = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!AuthService.requireAdmin()) return;
  await loadDashboardData();
});

async function loadDashboardData() {
  try {
    showLoading();
    
    const [bookingsRes, packagesRes, usersRes] = await Promise.all([
      ApiService.get(API_ENDPOINTS.bookings),
      ApiService.get(API_ENDPOINTS.packages),
      ApiService.get(API_ENDPOINTS.users)
    ]);

    bookings = bookingsRes.data;
    packages = packagesRes.data;
    users = usersRes.data;

    displayStats();
    displayBookings();
    displayPackages();
    displayUsers();
  } catch (error) {
    console.error('Error loading dashboard:', error);
    showAlert('Failed to load dashboard data', 'error');
  } finally {
    hideLoading();
  }
}

function displayStats() {
  const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.total_amount), 0);
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;

  const statsHTML = `
    <div class="stat-card">
      <div class="stat-icon">📊</div>
      <h3>Total Bookings</h3>
      <p class="stat-value" style="color: #667eea;">${bookings.length}</p>
    </div>
    <div class="stat-card">
      <div class="stat-icon">💰</div>
      <h3>Total Revenue</h3>
      <p class="stat-value" style="color: #28a745;">$${totalRevenue.toFixed(2)}</p>
    </div>
    <div class="stat-card">
      <div class="stat-icon">⏳</div>
      <h3>Pending</h3>
      <p class="stat-value" style="color: #ffc107;">${pendingBookings}</p>
    </div>
    <div class="stat-card">
      <div class="stat-icon">📦</div>
      <h3>Packages</h3>
      <p class="stat-value" style="color: #17a2b8;">${packages.length}</p>
    </div>
    <div class="stat-card">
      <div class="stat-icon">👥</div>
      <h3>Users</h3>
      <p class="stat-value" style="color: #6c757d;">${users.length}</p>
    </div>
  `;

  document.getElementById('stats-container').innerHTML = statsHTML;
}

function displayBookings() {
  const tbody = document.querySelector('#bookings-table tbody');
  
  tbody.innerHTML = bookings.map(booking => `
    <tr>
      <td>${booking.booking_id}</td>
      <td>${booking.full_name}</td>
      <td>${booking.package_title}</td>
      <td>${new Date(booking.travel_date).toLocaleDateString()}</td>
      <td>${booking.num_people}</td>
      <td>$${booking.total_amount}</td>
      <td>
        <select onchange="updateBookingStatus(${booking.booking_id}, this.value, '${booking.payment_status}')" 
                style="padding: 0.5rem; border-radius: 5px; border: 1px solid #e0e0e0;">
          <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="confirmed" ${booking.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>Completed</option>
          <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td>
        <select onchange="updateBookingStatus(${booking.booking_id}, '${booking.status}', this.value)" 
                style="padding: 0.5rem; border-radius: 5px; border: 1px solid #e0e0e0;">
          <option value="pending" ${booking.payment_status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="paid" ${booking.payment_status === 'paid' ? 'selected' : ''}>Paid</option>
          <option value="refunded" ${booking.payment_status === 'refunded' ? 'selected' : ''}>Refunded</option>
        </select>
      </td>
      <td>
        <a href="mailto:${booking.email}" style="color: #667eea;">Contact</a>
      </td>
    </tr>
  `).join('');
}

function displayPackages() {
  const container = document.getElementById('packages-grid');
  
  container.innerHTML = packages.map(pkg => `
    <div class="card">
      <img src="${pkg.image_url || 'https://via.placeholder.com/400x300'}" 
           alt="${pkg.title}" 
           class="card-image">
      <div class="card-body">
        <h3 class="card-title">${pkg.title}</h3>
        <p class="card-text">📍 ${pkg.destination_name}</p>
        <div class="card-price">$${pkg.price}</div>
        <p style="margin-bottom: 1rem;">
          Status: ${pkg.available ? '✅ Available' : '❌ Unavailable'}
        </p>
        <button onclick="deletePackage(${pkg.package_id})" class="btn btn-danger" style="width: 100%;">
          Delete Package
        </button>
      </div>
    </div>
  `).join('');
}

function displayUsers() {
  const tbody = document.querySelector('#users-table tbody');
  
  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${user.user_id}</td>
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>${user.full_name}</td>
      <td>${user.phone || '-'}</td>
      <td style="text-transform: capitalize;">${user.role}</td>
      <td>${new Date(user.created_at).toLocaleDateString()}</td>
    </tr>
  `).join('');
}

async function updateBookingStatus(bookingId, status, paymentStatus) {
  try {
    showLoading();
    await ApiService.put(API_ENDPOINTS.updateBookingStatus(bookingId), {
      status,
      payment_status: paymentStatus
    });
    showAlert('Booking status updated successfully', 'success');
    await loadDashboardData();
  } catch (error) {
    showAlert(error.message || 'Failed to update booking status', 'error');
    hideLoading();
  }
}

async function deletePackage(packageId) {
  if (!confirm('Are you sure you want to delete this package?')) {
    return;
  }

  try {
    showLoading();
    await ApiService.delete(API_ENDPOINTS.package(packageId));
    showAlert('Package deleted successfully', 'success');
    await loadDashboardData();
  } catch (error) {
    showAlert(error.message || 'Failed to delete package', 'error');
    hideLoading();
  }
}

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  event.target.classList.add('active');

  // Update tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tabName}-tab`).classList.add('active');
}