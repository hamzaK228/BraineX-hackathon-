/**
 * BraineX Global JavaScript
 * Shared utilities and functions across all pages
 */

// Initialize auth API and AI Assistant on page load
document.addEventListener('DOMContentLoaded', () => {
  // Inject AI Assistant Assets
  injectAIAssets();

  // Inject auth modals if missing (crucial for subpages)
  ensureAuthModals();

  // Wire up auth button click handlers
  setupAuthButtons();

  // Wire up form submissions for inline modals
  setupAuthForms();

  // Wire up modal switch links and password toggles
  setupModalInteractions();

  // Check authentication status
  if (window.authAPI && window.authAPI.isAuthenticated()) {
    updateUIForAuthenticatedUser();
  }
});

/**
 * Dynamically inject AI Assistant CSS and JS
 */
function injectAIAssets() {
  // CSS
  if (!document.getElementById('ai-assistant-css')) {
    const link = document.createElement('link');
    link.id = 'ai-assistant-css';
    link.rel = 'stylesheet';
    link.href = '/assets/css/ai-assistant.css';
    document.head.appendChild(link);
  }

  // JS
  if (!document.getElementById('ai-assistant-js')) {
    const script = document.createElement('script');
    script.id = 'ai-assistant-js';
    script.src = '/assets/js/ai-assistant.js';
    document.body.appendChild(script);
  }
}

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
    // setTimeout(() => {
    //   window.location.href = '/';
    // }, 2000);
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
    document.querySelectorAll('.modal').forEach((m) => {
      m.classList.remove('show', 'active');
      m.style.display = 'none';
    });
    document.body.style.overflow = '';
  },
  openModal: function (id) {
    // Close any open modals first
    this.closeModal();
    const m = document.getElementById(id);
    if (m) {
      m.classList.add('show', 'active');
      m.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      // Focus first input
      const firstInput = m.querySelector('input:not([type="hidden"]):not([type="checkbox"])');
      if (firstInput) setTimeout(() => firstInput.focus(), 100);
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

/**
 * Ensure authentication modals (Login/Signup) exist in the DOM.
 * If not present, injects the standard BraineX auth modal HTML.
 */
function ensureAuthModals() {
  if (document.getElementById('loginModal')) return;

  const modalOverlay = document.createElement('div');
  modalOverlay.innerHTML = `
    <!-- Login Modal -->
    <div id="loginModal" class="modal">
        <div class="modal-content">
            <button class="close-modal">&times;</button>
            <h2>Welcome Back</h2>
            <p>Sign in to access your personalized dashboard</p>
            <div id="loginSuccess" class="success-message">
                <strong>Success!</strong> You have been logged in successfully.
            </div>
            <form id="loginForm" class="auth-form">
                <div class="form-group">
                    <label for="loginEmail">Email Address</label>
                    <input type="email" id="loginEmail" name="email" required placeholder="your@email.com">
                    <div class="error-message" id="emailError">Please enter a valid email address</div>
                </div>
                <div class="form-group">
                    <label for="loginPassword">Password</label>
                    <div class="password-toggle">
                        <input type="password" id="loginPassword" name="password" required placeholder="••••••••">
                        <button type="button" class="btn-toggle-password" data-target="loginPassword">👁️</button>
                    </div>
                    <div class="error-message" id="passwordError">Password must be at least 6 characters</div>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="rememberMe" name="remember">
                    <label for="rememberMe">Remember me</label>
                </div>
                <button type="submit" class="btn-submit">Sign In</button>
            </form>
            <div class="divider"><span>or</span></div>
            <div class="social-login">
                <button class="btn-social" data-provider="google">🔍</button>
                <button class="btn-social" data-provider="facebook">📘</button>
                <button class="btn-social" data-provider="linkedin">💼</button>
            </div>
            <div class="form-footer">
                <p>Don't have an account? <a href="#signup" class="js-switch-signup">Sign up here</a></p>
                <p><a href="#forgot" class="js-forgot-password">Forgot your password?</a></p>
            </div>
        </div>
    </div>

    <!-- Signup Modal -->
    <div id="signupModal" class="modal">
        <div class="modal-content">
            <button class="close-modal">&times;</button>
            <h2>Join BraineX</h2>
            <p>Create your account and unlock endless opportunities</p>
            <div id="signupSuccess" class="success-message">
                <strong>Success!</strong> Your account has been created successfully.
            </div>
            <form id="signupForm" class="auth-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="firstName">First Name</label>
                        <input type="text" id="firstName" name="firstName" required placeholder="First Name">
                        <div class="error-message" id="firstNameError">First name is required</div>
                    </div>
                    <div class="form-group">
                        <label for="lastName">Last Name</label>
                        <input type="text" id="lastName" name="lastName" required placeholder="Last Name">
                        <div class="error-message" id="lastNameError">Last name is required</div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="signupEmail">Email Address</label>
                    <input type="email" id="signupEmail" name="email" required placeholder="your@email.com">
                    <div class="error-message" id="signupEmailError">Please enter a valid email address</div>
                </div>
                <div class="form-group">
                    <label for="signupPassword">Password</label>
                    <div class="password-toggle">
                        <input type="password" id="signupPassword" name="password" required placeholder="••••••••">
                        <button type="button" class="btn-toggle-password" data-target="signupPassword">👁️</button>
                    </div>
                    <div class="error-message" id="signupPasswordError">Password must be at least 6 characters</div>
                </div>
                <div class="form-group">
                    <label for="confirmPassword">Confirm Password</label>
                    <div class="password-toggle">
                        <input type="password" id="confirmPassword" name="confirmPassword" required placeholder="••••••••">
                        <button type="button" class="btn-toggle-password" data-target="confirmPassword">👁️</button>
                    </div>
                    <div class="error-message" id="confirmPasswordError">Passwords do not match</div>
                </div>
                <div class="form-group">
                    <label for="fieldOfInterest">Field of Interest</label>
                    <select id="fieldOfInterest" name="field" required>
                        <option value="">Select your field</option>
                        <option value="ai">Artificial Intelligence</option>
                        <option value="biotech">Biotech & Health Sciences</option>
                        <option value="climate">Climate Tech</option>
                        <option value="engineering">Engineering</option>
                        <option value="entrepreneurship">Entrepreneurship</option>
                        <option value="social">Social Impact</option>
                        <option value="media">Digital Media</option>
                        <option value="economics">Economics & Finance</option>
                    </select>
                    <div class="error-message" id="fieldError">Please select your field of interest</div>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="agreeTerms" name="terms" required>
                    <label for="agreeTerms">I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a></label>
                </div>
                <button type="submit" class="btn-submit">Create Account</button>
            </form>
            <div class="divider"><span>or</span></div>
            <div class="social-login">
                <button class="btn-social" data-provider="google">🔍</button>
                <button class="btn-social" data-provider="facebook">📘</button>
                <button class="btn-social" data-provider="linkedin">💼</button>
            </div>
            <div class="form-footer">
                <p>Already have an account? <a href="#login" class="js-switch-login">Sign in here</a></p>
            </div>
        </div>
    </div>
  `;
  document.body.appendChild(modalOverlay);
  
  // Wire up interactions for newly injected modals
  setupModalInteractions();
  setupAuthForms();
}

/**
 * Setup auth button click handlers (Login/Signup buttons in header)
 */
function setupAuthButtons() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a[href="#login"], a[href="#signup"]');
    if (!target) return;
    e.preventDefault();
    const hash = target.getAttribute('href');
    if (hash === '#login') {
      window.openModal('loginModal');
    } else if (hash === '#signup') {
      window.openModal('signupModal');
    }
  });
}

/**
 * Setup form submissions for both injected and inline login/signup modals
 */
function setupAuthForms() {
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm && !loginForm.dataset.wired) {
    loginForm.dataset.wired = '1';
    loginForm.addEventListener('submit', (e) => handleLogin(e));
  }

  // Signup form
  const signupForm = document.getElementById('signupForm');
  if (signupForm && !signupForm.dataset.wired) {
    signupForm.dataset.wired = '1';
    signupForm.addEventListener('submit', (e) => handleSignup(e));
  }
}

/**
 * Setup modal switch links (Login<->Signup) and password toggles
 */
function setupModalInteractions() {
  // Switch to signup
  document.querySelectorAll('.js-switch-signup, a[href="#signup"]').forEach(el => {
    // Only handle links inside modals
    if (el.closest('.modal')) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.closeModal();
        setTimeout(() => window.openModal('signupModal'), 50);
      });
    }
  });

  // Switch to login
  document.querySelectorAll('.js-switch-login, a[href="#login"]').forEach(el => {
    if (el.closest('.modal')) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.closeModal();
        setTimeout(() => window.openModal('loginModal'), 50);
      });
    }
  });

  // Password toggles
  document.querySelectorAll('.btn-toggle-password').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.dataset.target;
      if (targetId) {
        const input = document.getElementById(targetId);
        if (input) {
          input.type = input.type === 'password' ? 'text' : 'password';
          btn.textContent = input.type === 'password' ? '👁️' : '🙈';
        }
      }
    });
  });

  // Close modal buttons
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.closeModal();
    });
  });

  // Forgot password
  document.querySelectorAll('.js-forgot-password').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Forgot password flow not implemented in this demo.');
    });
  });
}

/**
 * Handle direct login form submission (works with both injected and inline modals)
 */
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail')?.value;
  const password = document.getElementById('loginPassword')?.value;
  const remember = document.getElementById('rememberMe')?.checked || false;

  if (!email || !password) {
    showNotification('Please fill in all fields', 'error');
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
  }

  try {
    if (window.authAPI && window.authAPI.login) {
      const response = await window.authAPI.login({ email, password, remember });
      if (response.success) {
        showNotification('Successfully logged in!', 'success');
        window.closeModal();
        setTimeout(() => window.location.reload(), 500);
      } else {
        showNotification(response.message || 'Login failed', 'error');
      }
    } else {
      // Demo mode: no backend
      showNotification('Login successful (demo mode)', 'success');
      window.closeModal();
    }
  } catch (err) {
    handleAPIError(err);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
}

/**
 * Handle direct signup form submission (works with both injected and inline modals)
 */
async function handleSignup(e) {
  e.preventDefault();
  const signupData = {
    firstName: document.getElementById('firstName')?.value,
    lastName: document.getElementById('lastName')?.value,
    email: document.getElementById('signupEmail')?.value,
    password: document.getElementById('signupPassword')?.value,
    confirmPassword: document.getElementById('confirmPassword')?.value,
    field: document.getElementById('fieldOfInterest')?.value
  };

  // Validate
  if (!signupData.firstName || !signupData.lastName || !signupData.email || !signupData.password || !signupData.field) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }

  // Check password confirmation
  const confirmPass = document.getElementById('confirmPassword');
  if (confirmPass && confirmPass.value !== signupData.password) {
    showNotification('Passwords do not match', 'error');
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';
  }

  try {
    if (window.authAPI && window.authAPI.register) {
      const response = await window.authAPI.register(signupData);
      if (response.success) {
        showNotification('Account created successfully!', 'success');
        window.closeModal();
        setTimeout(() => window.location.reload(), 500);
      } else {
        showNotification(response.message || 'Signup failed', 'error');
      }
    } else {
      // Demo mode: no backend
      showNotification('Account created (demo mode)', 'success');
      window.closeModal();
    }
  } catch (err) {
    handleAPIError(err);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
}

// Global shorthand for closing modals if used directly
window.closeModal = window.BraineX.closeModal.bind(window.BraineX);
window.openModal = window.BraineX.openModal.bind(window.BraineX);
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.ensureAuthModals = ensureAuthModals;
