// Authentication Service
const AuthService = {
  // Check if user is authenticated
  isAuthenticated() {
    return localStorage.getItem('token') !== null;
  },

  // Get current user
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get token
  getToken() {
    return localStorage.getItem('token');
  },

  // Save auth data
  saveAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
  },

  // Check if user is admin
  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  },

  // Redirect if not authenticated
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/pages/login.html';
      return false;
    }
    return true;
  },

  // Redirect if not admin
  requireAdmin() {
    if (!this.isAuthenticated() || !this.isAdmin()) {
      window.location.href = '/index.html';
      return false;
    }
    return true;
  }
};

// Update navbar based on auth status
function updateNavbar() {
  const authLinks = document.getElementById('auth-links');
  const userLinks = document.getElementById('user-links');
  const adminLink = document.getElementById('admin-link');
  const usernameSpan = document.getElementById('username');

  if (AuthService.isAuthenticated()) {
    const user = AuthService.getUser();
    if (authLinks) authLinks.style.display = 'none';
    if (userLinks) userLinks.style.display = 'flex';
    if (usernameSpan) usernameSpan.textContent = user.username;
    
    if (adminLink) {
      adminLink.style.display = AuthService.isAdmin() ? 'block' : 'none';
    }
  } else {
    if (authLinks) authLinks.style.display = 'flex';
    if (userLinks) userLinks.style.display = 'none';
  }
}

// Logout function
function logout() {
  AuthService.logout();
}

// Call updateNavbar on page load
document.addEventListener('DOMContentLoaded', updateNavbar);