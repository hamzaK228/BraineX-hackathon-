/**
 * BUTTON STATE ENGINE v2.0
 * Manages button states (idle, loading, success, error) with accessibility support.
 */

class ButtonStateEngine {
  /**
   * @param {HTMLButtonElement} button - The button element to manage.
   * @param {Object} [options] - Configuration options.
   * @param {string} [options.loadingText] - Text to show during loading.
   * @param {number} [options.successDuration] - Duration of success state in ms.
   * @param {number} [options.errorDuration] - Duration of error state in ms.
   * @param {boolean} [options.preventDoubleClick] - Whether to debounce clicks.
   * @param {string} [options.spinnerTemplate] - HTML for the loading spinner.
   */
  constructor(button, options = {}) {
    if (!button) throw new Error('ButtonStateEngine: Valid button element required');

    this.button = button;
    this.originalHTML = button.innerHTML;
    this.originalDisabled = button.disabled;
    this.originalAriaLabel = button.getAttribute('aria-label') || '';

    // State tracking
    this.currentState = 'idle';
    this.states = {
      IDLE: 'idle',
      LOADING: 'loading',
      SUCCESS: 'success',
      ERROR: 'error',
      DISABLED: 'disabled',
    };

    // Configuration
    this.options = {
      loadingText: options.loadingText || 'Processing...',
      successDuration: options.successDuration || 2000,
      errorDuration: options.errorDuration || 5000,
      preventDoubleClick: options.preventDoubleClick !== false,
      spinnerTemplate:
        options.spinnerTemplate || '<span class="bse-spinner" aria-hidden="true"></span>',
    };

    this.lastClickTime = 0;
    this.successTimer = null;
    this.errorTimer = null;

    this.init();
  }

  /**
   * Initialize event listeners and ARIA attributes.
   */
  init() {
    if (!this.button.getAttribute('aria-live')) {
      this.button.setAttribute('aria-live', 'polite');
    }

    if (this.options.preventDoubleClick) {
      this.button.addEventListener('click', (e) => this.handleClick(e), { capture: true });
    }
  }

  /**
   * Handle click events to prevent double submission.
   * @param {Event} e - Click event.
   */
  handleClick(e) {
    if (this.currentState !== this.states.IDLE) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return;
    }

    const now = Date.now();
    if (now - this.lastClickTime < 500) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return;
    }
    this.lastClickTime = now;
  }

  /**
   * Set button to loading state.
   * @param {string} [customText] - Optional text to override default loading text.
   */
  setLoading(customText) {
    if (this.currentState === this.states.LOADING) return;

    this.button.disabled = true;

    const text = customText || this.options.loadingText;
    this.button.innerHTML = `${this.options.spinnerTemplate} ${text}`;

    this.button.setAttribute('aria-busy', 'true');
    this.button.setAttribute('aria-label', text);

    this.lastClickTime = Date.now();
    this.currentState = this.states.LOADING;
    this.button.classList.add('bse-loading');
  }

  /**
   * Set button to success state.
   * @param {string} [message] - Success message to display.
   */
  setSuccess(message = 'Success!') {
    this.button.disabled = true;
    this.button.innerHTML = `<span class="bse-icon-success">✓</span> ${message}`;
    this.button.setAttribute('aria-label', message);
    this.button.removeAttribute('aria-busy');

    this.button.classList.remove('bse-loading', 'bse-error');
    this.button.classList.add('bse-success');

    this.currentState = this.states.SUCCESS;

    if (this.successTimer) clearTimeout(this.successTimer);
    this.successTimer = setTimeout(() => {
      if (this.currentState === this.states.SUCCESS) {
        this.restore();
      }
    }, this.options.successDuration);
  }

  /**
   * Set button to error state.
   * @param {string} [message] - Error message to display.
   * @param {Function} [retryCallback] - Optional callback for retry action.
   */
  setError(message = 'An error occurred', retryCallback = null) {
    this.button.disabled = false;
    this.button.innerHTML = `<span class="bse-icon-error">⚠️</span> ${message}`;
    this.button.setAttribute('aria-label', message);
    this.button.removeAttribute('aria-busy');

    this.button.classList.remove('bse-loading', 'bse-success');
    this.button.classList.add('bse-error');

    this.currentState = this.states.ERROR;

    if (typeof retryCallback === 'function') {
      const retryHandler = (e) => {
        this.button.removeEventListener('click', retryHandler);
        retryCallback(e);
      };
      this.button.addEventListener('click', retryHandler, { once: true });
    } else {
      if (this.errorTimer) clearTimeout(this.errorTimer);
      this.errorTimer = setTimeout(() => {
        if (this.currentState === this.states.ERROR) {
          this.restore();
        }
      }, this.options.errorDuration);
    }

    this.button.focus();
  }

  /**
   * Restore button to original state.
   */
  restore() {
    this.button.innerHTML = this.originalHTML;
    this.button.disabled = this.originalDisabled;

    if (this.originalAriaLabel) {
      this.button.setAttribute('aria-label', this.originalAriaLabel);
    } else {
      this.button.removeAttribute('aria-label');
    }
    this.button.removeAttribute('aria-busy');

    this.button.classList.remove('bse-loading', 'bse-success', 'bse-error');
    this.currentState = this.states.IDLE;

    if (this.successTimer) clearTimeout(this.successTimer);
    if (this.errorTimer) clearTimeout(this.errorTimer);
  }

  /**
   * Check if button is currently processing.
   * @returns {boolean} True if in loading state.
   */
  isProcessing() {
    return this.currentState === this.states.LOADING;
  }
}

const ButtonStateManager = {
  engines: new Map(),

  /**
   * Initialize all buttons matching selector.
   * @param {string} [selector] - CSS selector for buttons.
   */
  initAll: (selector = '[data-button-state]') => {
    const buttons = document.querySelectorAll(selector);
    buttons.forEach((btn) => {
      if (!ButtonStateManager.engines.has(btn)) {
        ButtonStateManager.engines.set(btn, new ButtonStateEngine(btn));
      }
    });
  },

  /**
   * Get or create engine for a button.
   * @param {HTMLButtonElement} button - The button element.
   * @returns {ButtonStateEngine} The engine instance.
   */
  getEngine: (button) => {
    if (!ButtonStateManager.engines.has(button)) {
      ButtonStateManager.engines.set(button, new ButtonStateEngine(button));
    }
    return ButtonStateManager.engines.get(button);
  },

  /**
   * Debounce a click handler.
   * @param {HTMLButtonElement} button - Button to attach to.
   * @param {Function} callback - Function to run on click.
   * @param {number} [delay] - Debounce delay in ms.
   */
  debounceClick: (button, callback, delay = 2000) => {
    let lastClick = 0;
    button.addEventListener('click', (e) => {
      const now = Date.now();
      if (now - lastClick >= delay) {
        lastClick = now;
        callback(e);
      } else {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    });
  },

  /**
   * Show a toast notification.
   * @param {string} message - Message to show.
   * @param {string} [type] - 'info', 'success', or 'error'.
   */
  createToast: (message, type = 'info') => {
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, type);
    } else {
      const container =
        document.getElementById('bse-toasts') ||
        (() => {
          const c = document.createElement('div');
          c.id = 'bse-toasts';
          c.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;pointer-events:none;';
          document.body.appendChild(c);
          return c;
        })();

      const toast = document.createElement('div');
      toast.textContent = message;
      toast.style.cssText = `
                background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
                color:white;padding:12px;margin-bottom:10px;border-radius:6px;box-shadow:0 4px 6px rgba(0,0,0,0.1);
                pointer-events:auto;
            `;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);
    }
  },
};

window.ButtonStateEngine = ButtonStateEngine;
window.ButtonStateManager = ButtonStateManager;

(function () {
  if (document.getElementById('bse-styles')) return;
  const style = document.createElement('style');
  style.id = 'bse-styles';
  style.textContent = `
    .bse-loading { opacity: 0.8; cursor: wait; }
    .bse-success { background-color: var(--color-success, #10b981) !important; color: white !important; border-color: transparent !important; }
    .bse-error { background-color: var(--color-error, #ef4444) !important; color: white !important; border-color: transparent !important; animation: bse-shake 0.4s ease-in-out; }
    .bse-spinner { display: inline-block; width: 1em; height: 1em; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: bse-spin 0.75s linear infinite; margin-right: 0.5em; vertical-align: text-bottom; }
    @keyframes bse-spin { to { transform: rotate(360deg); } }
    @keyframes bse-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
`;
  document.head.appendChild(style);
})();
