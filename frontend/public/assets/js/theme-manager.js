/**
 * BraineX Theme Manager
 * Handles theme switching, persistence, and system preference detection
 */

(function () {
  'use strict';

  const ThemeManager = {
    // Theme constants
    LIGHT: 'light',
    DARK: 'dark',
    STORAGE_KEY: 'brainex-theme',
    TRANSITION_CLASS: 'theme-transitioning',
    TRANSITION_DURATION: 300,

    /**
     * Initialize theme manager
     */
    init: function () {
      // Apply saved theme or detect system preference
      this.applyInitialTheme();

      // Listen for system preference changes
      this.watchSystemPreference();

      // Bind toggle buttons
      this.bindToggleButtons();

      console.log('🎨 ThemeManager initialized');
    },

    /**
     * Get current theme
     */
    getCurrentTheme: function () {
      return document.documentElement.getAttribute('data-theme') || this.LIGHT;
    },

    /**
     * Get saved theme from localStorage
     */
    getSavedTheme: function () {
      try {
        return localStorage.getItem(this.STORAGE_KEY);
      } catch (e) {
        console.warn('Unable to access localStorage:', e);
        return null;
      }
    },

    /**
     * Save theme to localStorage
     */
    saveTheme: function (theme) {
      try {
        localStorage.setItem(this.STORAGE_KEY, theme);
      } catch (e) {
        console.warn('Unable to save theme to localStorage:', e);
      }
    },

    /**
     * Get system color scheme preference
     */
    getSystemPreference: function () {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return this.DARK;
      }
      return this.LIGHT;
    },

    /**
     * Apply initial theme based on saved preference or system preference
     */
    applyInitialTheme: function () {
      const savedTheme = this.getSavedTheme();
      const systemTheme = this.getSystemPreference();

      // Priority: saved > system > light
      const theme = savedTheme || systemTheme || this.LIGHT;

      // Apply without transition on initial load
      document.documentElement.setAttribute('data-theme', theme);
      this.updateToggleButtons(theme);
    },

    /**
     * Set theme with smooth transition
     */
    setTheme: function (theme, save = true) {
      if (theme !== this.LIGHT && theme !== this.DARK) {
        console.warn('Invalid theme:', theme);
        return;
      }

      const currentTheme = this.getCurrentTheme();
      if (currentTheme === theme) return;

      // Add transition class
      document.documentElement.classList.add(this.TRANSITION_CLASS);

      // Set the new theme
      document.documentElement.setAttribute('data-theme', theme);
      this.updateToggleButtons(theme);

      // Save preference
      if (save) {
        this.saveTheme(theme);
      }

      // Remove transition class after animation
      setTimeout(() => {
        document.documentElement.classList.remove(this.TRANSITION_CLASS);
      }, this.TRANSITION_DURATION);

      // Dispatch custom event
      window.dispatchEvent(
        new CustomEvent('themechange', {
          detail: { theme, previousTheme: currentTheme },
        })
      );
    },

    /**
     * Toggle between light and dark themes
     */
    toggle: function () {
      const currentTheme = this.getCurrentTheme();
      const newTheme = currentTheme === this.LIGHT ? this.DARK : this.LIGHT;
      this.setTheme(newTheme);
      return newTheme;
    },

    /**
     * Watch for system preference changes
     */
    watchSystemPreference: function () {
      if (!window.matchMedia) return;

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (e) => {
        // Only auto-switch if user hasn't manually set a preference
        const savedTheme = this.getSavedTheme();
        if (!savedTheme) {
          this.setTheme(e.matches ? this.DARK : this.LIGHT, false);
        }
      };

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else if (mediaQuery.addListener) {
        // Legacy Safari
        mediaQuery.addListener(handleChange);
      }
    },

    /**
     * Bind click handlers to theme toggle buttons
     */
    bindToggleButtons: function () {
      // Find all theme toggle buttons
      const toggleButtons = document.querySelectorAll(
        '.theme-toggle, [data-theme-toggle], #themeToggle, .dark-mode-toggle'
      );

      toggleButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggle();
        });
      });

      // Also add global function for onclick handlers
      window.toggleTheme = () => this.toggle();
    },

    /**
     * Update toggle button text/icon based on current theme
     */
    updateToggleButtons: function (theme) {
      const toggleButtons = document.querySelectorAll(
        '.theme-toggle, [data-theme-toggle], #themeToggle, .dark-mode-toggle'
      );

      toggleButtons.forEach((button) => {
        const isDark = theme === this.DARK;

        // Update text content if it's a text button
        if (button.classList.contains('theme-toggle')) {
          button.innerHTML = isDark ? '☀️ <span>Light</span>' : '🌙 <span>Dark</span>';
        }

        // Update aria-label for accessibility
        button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');

        // Update data attribute
        button.setAttribute('data-current-theme', theme);
      });
    },

    /**
     * Check if dark mode is active
     */
    isDark: function () {
      return this.getCurrentTheme() === this.DARK;
    },

    /**
     * Check if light mode is active
     */
    isLight: function () {
      return this.getCurrentTheme() === this.LIGHT;
    },

    /**
     * Reset theme to system preference and clear saved preference
     */
    reset: function () {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch (e) {}

      const systemTheme = this.getSystemPreference();
      this.setTheme(systemTheme, false);
    },
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
  } else {
    ThemeManager.init();
  }

  // Expose globally
  window.ThemeManager = ThemeManager;

  // Legacy support - global toggleTheme function
  window.toggleTheme = function () {
    return ThemeManager.toggle();
  };
})();
