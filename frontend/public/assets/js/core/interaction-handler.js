/**
 * BraineX Unified Interaction Handler
 * Provides consistent button handling, modal management, and navigation across all pages.
 */

const InteractionHandler = (function () {
  'use strict';

  // Track active modals
  let activeModal = null;

  // Bookmark storage
  const BOOKMARKS_KEY = 'brainex_bookmarks';

  /**
   * Initialize the interaction handler
   */
  function init() {
    setupGlobalDelegation();
    setupModalHandlers();
    setupKeyboardHandlers();
    console.log('InteractionHandler initialized');
  }

  /**
   * Setup event delegation for common button classes
   */
  function setupGlobalDelegation() {
    document.addEventListener('click', function (e) {
      const target = e.target.closest('button, a, [role="button"]');
      if (!target) return;

      // NOTE: btn-explore buttons use onclick="openTrackDetail('...')" directly
      // Skip handling here to avoid conflicts
      if (target.classList.contains('btn-explore')) {
        return; // Let onclick handle it
      }

      // Handle category buttons only
      if (target.classList.contains('btn-category')) {
        handleExploreButton(e, target);
      }

      // Handle view detail buttons
      if (
        target.classList.contains('btn-view-detail') ||
        target.classList.contains('btn-apply') ||
        target.textContent.toLowerCase().includes('view detail')
      ) {
        handleViewDetailButton(e, target);
      }

      // Handle bookmark buttons
      if (target.classList.contains('btn-bookmark') || target.querySelector('.fa-bookmark')) {
        handleBookmarkButton(e, target);
      }

      // Handle modal close buttons
      if (target.classList.contains('close-modal') || target.classList.contains('modal-close')) {
        e.preventDefault();
        closeActiveModal();
      }
    });
  }

  /**
   * Handle explore button clicks
   */
  function handleExploreButton(e, target) {
    const category = target.dataset.category || target.closest('[data-category]')?.dataset.category;

    // Add visual feedback
    addClickFeedback(target);

    // If has href, let it navigate
    if (target.href && !target.href.includes('#')) {
      return;
    }

    // Otherwise, filter content or show modal
    if (category) {
      e.preventDefault();
      const event = new CustomEvent('brainex:explore', {
        detail: { category, target },
        bubbles: true,
      });
      document.dispatchEvent(event);
    }
  }

  /**
   * Handle view detail button clicks
   */
  function handleViewDetailButton(e, target) {
    // Add visual feedback
    addClickFeedback(target);

    // Get item ID from data attribute or parent
    const itemId =
      target.dataset.id ||
      target.closest('[data-id]')?.dataset.id ||
      target.closest('[data-item-id]')?.dataset.itemId;

    const itemType = target.dataset.type || target.closest('[data-type]')?.dataset.type;

    if (itemId) {
      const event = new CustomEvent('brainex:viewDetail', {
        detail: { id: itemId, type: itemType, target },
        bubbles: true,
      });
      document.dispatchEvent(event);
    }
  }

  /**
   * Handle bookmark button clicks
   */
  function handleBookmarkButton(e, target) {
    e.preventDefault();
    e.stopPropagation();

    const itemId =
      target.dataset.id ||
      target.closest('[data-id]')?.dataset.id ||
      target.closest('[data-item-id]')?.dataset.itemId;

    if (!itemId) return;

    const isBookmarked = toggleBookmark(itemId);

    // Update UI
    target.classList.toggle('bookmarked', isBookmarked);
    target.classList.toggle('active', isBookmarked);

    // Update icon if using FontAwesome
    const icon = target.querySelector('i.fa-bookmark, i.fas.fa-bookmark, i.far.fa-bookmark');
    if (icon) {
      icon.classList.toggle('fas', isBookmarked);
      icon.classList.toggle('far', !isBookmarked);
    }

    // Show feedback
    showToast(isBookmarked ? 'Added to bookmarks' : 'Removed from bookmarks');

    const event = new CustomEvent('brainex:bookmark', {
      detail: { id: itemId, bookmarked: isBookmarked },
      bubbles: true,
    });
    document.dispatchEvent(event);
  }

  /**
   * Toggle bookmark state in localStorage
   */
  function toggleBookmark(itemId) {
    const bookmarks = getBookmarks();
    const index = bookmarks.indexOf(itemId);

    if (index > -1) {
      bookmarks.splice(index, 1);
    } else {
      bookmarks.push(itemId);
    }

    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return index === -1; // Return new bookmarked state
  }

  /**
   * Get all bookmarks
   */
  function getBookmarks() {
    try {
      return JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) || [];
    } catch {
      return [];
    }
  }

  /**
   * Check if item is bookmarked
   */
  function isBookmarked(itemId) {
    return getBookmarks().includes(itemId);
  }

  /**
   * Add click feedback animation
   */
  function addClickFeedback(element) {
    element.style.transform = 'scale(0.95)';
    element.style.opacity = '0.8';

    setTimeout(() => {
      element.style.transform = '';
      element.style.opacity = '';
    }, 150);
  }

  /**
   * Setup modal handlers
   */
  function setupModalHandlers() {
    // Close modal on backdrop click - must click directly on the modal background, not content
    document.addEventListener('click', function (e) {
      // Only close if click is directly on the modal element (the backdrop), not on its children
      if (e.target.classList.contains('modal') && !e.target.closest('.modal-content')) {
        closeActiveModal();
      }
    });
  }

  /**
   * Setup keyboard handlers
   */
  function setupKeyboardHandlers() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && activeModal) {
        closeActiveModal();
      }
    });
  }

  /**
   * Open a modal by ID
   */
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
      console.warn(`Modal with id "${modalId}" not found`);
      return null;
    }

    // Close any active modal first
    if (activeModal) {
      closeActiveModal();
    }

    modal.style.display = 'flex';
    modal.classList.add('active');
    activeModal = modal;
    document.body.style.overflow = 'hidden';

    // Focus first focusable element
    const focusable = modal.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) {
      setTimeout(() => focusable.focus(), 100);
    }

    return modal;
  }

  /**
   * Close the active modal
   */
  function closeActiveModal() {
    if (activeModal) {
      activeModal.style.display = 'none';
      activeModal.classList.remove('active');
      activeModal = null;
      document.body.style.overflow = '';
    }
  }

  /**
   * Close a specific modal by ID
   */
  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active');
      if (activeModal === modal) {
        activeModal = null;
        document.body.style.overflow = '';
      }
    }
  }

  /**
   * Create and show a dynamic modal
   */
  function showDynamicModal(options) {
    const {
      id = 'dynamicModal',
      title = '',
      content = '',
      actions = [],
      size = 'medium', // small, medium, large
    } = options;

    // Remove existing dynamic modal
    const existing = document.getElementById(id);
    if (existing) {
      existing.remove();
    }

    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal dynamic-modal';
    modal.innerHTML = `
      <div class="modal-content modal-${size}">
        <button class="close-modal" aria-label="Close modal">&times;</button>
        ${title ? `<h2 class="modal-title">${title}</h2>` : ''}
        <div class="modal-body">${content}</div>
        ${
          actions.length > 0
            ? `
          <div class="modal-actions">
            ${actions
              .map(
                (action) => `
              <button class="btn ${action.primary ? 'btn-primary' : 'btn-secondary'}" 
                      data-action="${action.id || ''}"
                      ${action.href ? `onclick="window.open('${action.href}', '_blank')"` : ''}>
                ${action.label}
              </button>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }
      </div>
    `;

    document.body.appendChild(modal);

    // Setup action handlers
    actions.forEach((action) => {
      if (action.onClick) {
        const btn = modal.querySelector(`[data-action="${action.id}"]`);
        if (btn) {
          btn.addEventListener('click', action.onClick);
        }
      }
    });

    return openModal(id);
  }

  /**
   * Show a toast notification
   */
  function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toast
    const existing = document.querySelector('.brainex-toast');
    if (existing) {
      existing.remove();
    }

    const toast = document.createElement('div');
    toast.className = `brainex-toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#667eea'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideUp 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /**
   * Navigate to a page with optional query parameters
   */
  function navigateTo(path, params = {}) {
    const url = new URL(path, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    window.location.href = url.toString();
  }

  /**
   * Scroll to an element smoothly
   */
  function scrollToElement(selector, offset = 100) {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;

    if (element) {
      const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from { transform: translateX(-50%) translateY(20px); opacity: 0; }
      to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    .modal.active {
      animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .dynamic-modal .modal-content {
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-small { max-width: 400px; }
    .modal-medium { max-width: 600px; }
    .modal-large { max-width: 900px; }
    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color, #e5e7eb);
    }
  `;
  document.head.appendChild(style);

  // Public API
  return {
    init,
    openModal,
    closeModal,
    closeActiveModal,
    showDynamicModal,
    showToast,
    navigateTo,
    scrollToElement,
    toggleBookmark,
    isBookmarked,
    getBookmarks,
    addClickFeedback,
  };
})();

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', InteractionHandler.init);
} else {
  InteractionHandler.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InteractionHandler;
}

// Also attach to window for global access
window.InteractionHandler = InteractionHandler;
// Legacy aliases
window.closeModal = InteractionHandler.closeActiveModal;
window.openModal = InteractionHandler.openModal;
