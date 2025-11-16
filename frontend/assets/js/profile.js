// Profile page functionality
document.addEventListener('DOMContentLoaded', () => {
  if (!AuthService.requireAuth()) return;
  loadProfile();
  setupEditForm();
});

function loadProfile() {
  const user = AuthService.getUser();
  
  document.getElementById('profile-username').textContent = user.username;
  document.getElementById('profile-email').textContent = user.email;
  document.getElementById('profile-fullname').textContent = user.full_name;
  document.getElementById('profile-phone').textContent = user.phone || 'Not provided';
  document.getElementById('profile-role').textContent = user.role;
  document.getElementById('profile-joined').textContent = new Date(user.created_at).toLocaleDateString();
  
  // Populate edit form
  document.getElementById('edit-fullname').value = user.full_name;
  document.getElementById('edit-phone').value = user.phone || '';
}

function showEditForm() {
  document.getElementById('profile-view').style.display = 'none';
  document.getElementById('profile-edit-form').style.display = 'block';
}

function hideEditForm() {
  document.getElementById('profile-view').style.display = 'block';
  document.getElementById('profile-edit-form').style.display = 'none';
}

function setupEditForm() {
  document.getElementById('profile-edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const updateData = {
      full_name: document.getElementById('edit-fullname').value,
      phone: document.getElementById('edit-phone').value
    };

    try {
      showLoading();
      const response = await ApiService.put(API_ENDPOINTS.updateProfile, updateData);
      
      // Update local storage
      const user = AuthService.getUser();
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      showAlert('Profile updated successfully!', 'success');
      hideEditForm();
      loadProfile();
      updateNavbar(); // Update navbar username
    } catch (error) {
      showAlert(error.message || 'Failed to update profile', 'error');
    } finally {
      hideLoading();
    }
  });
}