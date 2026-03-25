/**
 * ErrorBoundary.js
 * Provides resilient error handling and UI fallbacks.
 */

import { eventBus } from '../core/EventBus.js';

export const ErrorBoundary = {
  /**
   * Wrap a function in a try/catch block with optional UI fallback.
   * @param {Function} fn - The function to execute
   * @param {Object} options
   * @param {string} options.context - Name of operation for logging
   * @param {Element} options.fallbackContainer - Container to render error into
   * @returns {Promise<any>|null} Result of fn or null on error
   */
  async trySafe(fn, { context = 'Operation', fallbackContainer = null } = {}) {
    try {
      return await fn();
    } catch (error) {
      console.error(`[ErrorBoundary] Error in ${context}:`, error);

      // Publish error to EventBus (for analytics/toast)
      eventBus.publish('system:error', { context, error });

      // Render Fallback UI if container provided
      if (fallbackContainer instanceof Element) {
        fallbackContainer.innerHTML = `
                    <div class="error-boundary p-4 border border-red-200 bg-red-50 rounded-lg text-center">
                        <h4 class="text-red-800 font-semibold mb-2">Something went wrong</h4>
                        <p class="text-red-600 text-sm mb-3">We couldn't load this content.</p>
                        <button onclick="window.location.reload()" class="px-3 py-1 bg-white border border-red-300 text-red-700 rounded text-sm hover:bg-red-50">
                            Retry
                        </button>
                    </div>
                `;
      }
      return null;
    }
  },

  /**
   * Initialize global error handlers
   */
  initGlobal() {
    window.addEventListener('error', (event) => {
      console.error('[Global Error]', event.error);
      // Optionally show a toast for critical errors
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('[Unhandled Promise]', event.reason);
    });
  },
};
