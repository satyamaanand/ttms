// Home page functionality
document.addEventListener('DOMContentLoaded', async () => {
  await loadFeaturedPackages();
  setupNavbarScroll();
});

// Navbar scroll effect
function setupNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

async function loadFeaturedPackages() {
  try {
    showLoading();
    const response = await ApiService.get(`${API_ENDPOINTS.packages}?available=true`);
    const packages = response.data.slice(0, 3); // Get first 3 packages
    
    displayFeaturedPackages(packages);
  } catch (error) {
    console.error('Error loading packages:', error);
    showAlert('Failed to load featured packages', 'error');
  } finally {
    hideLoading();
  }
}

function displayFeaturedPackages(packages) {
  const container = document.getElementById('featured-packages');
  
  if (packages.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #666;">No packages available</p>';
    return;
  }

  container.innerHTML = packages.map(pkg => `
    <div class="card">
      <img src="${pkg.image_url || 'https://via.placeholder.com/400x300'}" 
           alt="${pkg.title}" 
           class="card-image">
      <div class="card-body">
        <h3 class="card-title">${pkg.title}</h3>
        <p class="card-text">📍 ${pkg.destination_name}, ${pkg.country}</p>
        <div class="card-details">
          <span>⏱️ ${pkg.duration_days}D/${pkg.duration_nights}N</span>
          <span>👥 Max ${pkg.max_people}</span>
        </div>
        <div class="card-price">${pkg.price}</div>
        <a href="pages/package-details.html?id=${pkg.package_id}" 
           class="btn btn-primary" 
           style="width: 100%; text-align: center;">
          View Details
        </a>
      </div>
    </div>
  `).join('');
}