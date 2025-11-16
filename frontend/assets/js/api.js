// API Service for making HTTP requests
const ApiService = {
  // Generic request method
  async request(url, options = {}) {
    const token = AuthService.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          AuthService.logout();
        }
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // GET request
  async get(url) {
    return this.request(url, { method: 'GET' });
  },

  // POST request
  async post(url, body) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  // PUT request
  async put(url, body) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  // DELETE request
  async delete(url) {
    return this.request(url, { method: 'DELETE' });
  }
};

// Show loading spinner
function showLoading() {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'flex';
}

// Hide loading spinner
function hideLoading() {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'none';
}

// Show alert message
function showAlert(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '80px';
  alertDiv.style.right = '20px';
  alertDiv.style.zIndex = '9999';
  alertDiv.style.minWidth = '300px';
  
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}