// Packages page functionality
document.addEventListener('DOMContentLoaded', async () => {
  await loadPackages();
});

async function loadPackages() {
  try {
    showLoading();
    
    const destination = document.getElementById('filter-destination').value;
    const minPrice = document.getElementById('filter-min-price').value;
    const maxPrice = document.getElementById('filter-max-price').value;

    let url = `${API_ENDPOINTS.packages}?available=true`;
    if (destination) url += `&destination=${destination}`;
    if (minPrice) url += `&minPrice=${minPrice}`;
    if (maxPrice) url += `&maxPrice=${maxPrice}`;

    const response = await ApiService.get(url);
    displayPackages(response.data);
  } catch (error) {
    console.error('Error loading packages:', error);
    showAlert('Failed to load packages', 'error');
  } finally {
    hideLoading();
  }
}

function displayPackages(packages) {
  const container = document.getElementById('packages-container');
  const countElement = document.getElementById('package-count');
  
  countElement.textContent = `Found ${packages.length} package${packages.length !== 1 ? 's' : ''}`;

  if (packages.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
        <h3>No packages found</h3>
        <p>Try adjusting your filters</p>
      </div>
    `;
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
        <p class="card-text" style="font-size: 0.9rem; height: 60px; overflow: hidden;">
          ${pkg.description}
        </p>
        <div class="card-details">
          <span>⏱️ ${pkg.duration_days}D/${pkg.duration_nights}N</span>
          <span>👥 Max ${pkg.max_people}</span>
        </div>
        ${pkg.avg_rating > 0 ? `
          <div style="margin-top: 0.5rem;">
            ⭐ ${parseFloat(pkg.avg_rating).toFixed(1)} (${pkg.review_count} reviews)
          </div>
        ` : ''}
        <div class="card-price">$${pkg.price}</div>
        <a href="package-details.html?id=${pkg.package_id}" 
           class="btn btn-primary" 
           style="width: 100%; text-align: center;">
          View Details
        </a>
      </div>
    </div>
  `).join('');
}

function applyFilters() {
  loadPackages();
}