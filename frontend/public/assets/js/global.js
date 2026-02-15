/**
 * BraineX Global JavaScript
 * Shared utilities and functions across all pages
 */

// Initialize auth API on page load
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication status
  if (window.authAPI && window.authAPI.isAuthenticated()) {
    updateUIForAuthenticatedUser();
  }
});

/**
 * Update UI elements for authenticated users
 */
function updateUIForAuthenticatedUser() {
  const authButtons = document.querySelector('.auth-buttons');
  const user = window.authAPI.user;

  if (authButtons && user) {
    authButtons.innerHTML = `
      <span style="color: white; margin-right: 1rem;">
        Welcome, ${user.firstName || user.name}!
      </span>
      ${user.role === 'admin' ? '<a href="/admin" class="btn btn-outline">Admin</a>' : ''}
      <button class="btn btn-primary" onclick="handleLogout()">Logout</button>
    `;
  }
}

/**
 * Handle logout
 */
async function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    try {
      await window.authAPI.logout();
    } catch (error) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.error('Logout failed:', error);
      }
      // Clear local state anyway
      window.authAPI.clearAuthState();
      window.location.href = '/';
    }
  }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existing = document.querySelector('.notification');
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  if (typeof amount === 'string') return amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Handle API errors
 */
function handleAPIError(error) {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.error('API Error:', error);
  }

  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    showNotification('Session expired. Please login again.', 'error');
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  } else {
    showNotification(error.message || 'An error occurred', 'error');
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Expose utilities to window
window.showNotification = showNotification;
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.handleAPIError = handleAPIError;
window.handleLogout = handleLogout;

// Namespace for specific page calls
window.BraineX = {
  showNotification,
  formatDate,
  formatCurrency,
  handleAPIError,
  handleLogout,
  apiRequest: async function (endpoint, options = {}) {
    const token = localStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`/api${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `API error: ${response.status}`);
      }
      return data;
    } catch (error) {
      this.handleAPIError(error);
      return { success: false, error: error.message };
    }
  },
  // Add modal helpers that pages might expect
  closeModal: function () {
    document.querySelectorAll('.modal').forEach((m) => m.classList.remove('show'));
    // Also support plain style display
    document.querySelectorAll('.modal').forEach((m) => (m.style.display = 'none'));
  },
  openModal: function (id) {
    const m = document.getElementById(id);
    if (m) {
      m.classList.add('show');
      m.style.display = 'block'; // Fallback
    }
  },
  togglePassword: function (id) {
    const input = document.getElementById(id);
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  },
  switchToSignup: function () {
    this.closeModal();
    this.openModal('signupModal');
  },
  forgotPassword: function () {
    alert('Forgot password flow not implemented in this demo.');
  },
  socialLogin: function (provider) {
    alert(`Login with ${provider} is not configured.`);
  },
};

// Global shorthand for closing modals if used directly
window.closeModal = window.BraineX.closeModal;
window.openModal = window.BraineX.openModal;
