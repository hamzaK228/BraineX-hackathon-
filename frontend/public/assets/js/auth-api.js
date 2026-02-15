/* eslint-disable no-console, no-unused-vars */
/**
 * BraineX Authentication API
 * Handles all authentication-related operations
 */

class AuthAPI {
  constructor() {
    this.apiURL = '/api';
    this.user = null;
    this.accessToken = null;
  }

  /**
   * Get authorization headers
   */
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  /**
   * Handle API response
   */
  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      const response = await fetch(`${this.apiURL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password,
          confirmPassword: userData.confirmPassword,
          field: userData.field,
        }),
        credentials: 'include',
      });

      const data = await this.handleResponse(response);

      if (data.success) {
        this.user = data.data.user;
        this.accessToken = data.data.accessToken;
        this.saveAuthState();
      }

      return data;
    } catch (error) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.error('Registration error:', error);
      }
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(credentials) {
    try {
      const response = await fetch(`${this.apiURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          remember: credentials.remember || false,
        }),
        credentials: 'include',
      });

      const data = await this.handleResponse(response);

      if (data.success) {
        this.user = data.data.user;
        this.accessToken = data.data.accessToken;
        this.saveAuthState();
      }

      return data;
    } catch (error) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.error('Login error:', error);
      }
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await fetch(`${this.apiURL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      this.clearAuthState();
      window.location.href = '/';
    } catch (error) {
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.error('Logout error:', error);
      }
      this.clearAuthState();
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    try {
      const response = await fetch(`${this.apiURL}/auth/me`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });

      const data = await this.handleResponse(response);

      if (data.success) {
        this.user = data.data;
        this.saveAuthState();
      }

      return data;
    } catch (error) {
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.error('Get current user error:', error);
      }
      this.clearAuthState();
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken() {
    try {
      const response = await fetch(`${this.apiURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await this.handleResponse(response);

      if (data.success) {
        this.accessToken = data.data.accessToken;
        localStorage.setItem('accessToken', this.accessToken);
      }

      return data;
    } catch (error) {
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.error('Token refresh error:', error);
      }
      this.clearAuthState();
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.accessToken && !!this.user;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role) {
    return this.user?.role === role;
  }

  /**
   * Save authentication state to localStorage
   */
  saveAuthState() {
    if (this.accessToken) {
      localStorage.setItem('accessToken', this.accessToken);
    }
    if (this.user) {
      localStorage.setItem('user', JSON.stringify(this.user));
    }
  }

  /**
   * Load authentication state from localStorage
   */
  loadAuthState() {
    const accessToken = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');

    if (accessToken) {
      this.accessToken = accessToken;
    }

    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch (e) {
        if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.error('Error parsing user data:', e);
        }
      }
    }
  }

  /**
   * Clear authentication state
   */
  clearAuthState() {
    this.user = null;
    this.accessToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  /**
   * Make authenticated API request
   */
  async apiRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.apiURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        credentials: 'include',
      });

      // Handle 401 - try to refresh token
      if (response.status === 401) {
        try {
          await this.refreshToken();
          // Retry the original request
          const retryResponse = await fetch(`${this.apiURL}${endpoint}`, {
            ...options,
            headers: {
              ...this.getAuthHeaders(),
              ...options.headers,
            },
            credentials: 'include',
          });
          return await this.handleResponse(retryResponse);
        } catch (refreshError) {
          this.clearAuthState();
          window.location.href = '/';
          throw refreshError;
        }
      }

      return await this.handleResponse(response);
    } catch (error) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.error('API request error:', error);
      }
      throw error;
    }
  }
}

// Create and export global instance
const authAPI = new AuthAPI();
authAPI.loadAuthState();

// Expose to window for compatibility
window.authAPI = authAPI;
