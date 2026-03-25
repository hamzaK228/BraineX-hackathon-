/**
 * Zero-G Interactions & Accessibility Engine
 * Handles micro-interactions, scroll animations, toasts, and a11y enhancements
 */

(function () {
  'use strict';

  // ========================================
  // Scroll Animations (Intersection Observer)
  // ========================================
  function initScrollAnimations() {
    // Tag elements for animation if not already tagged
    const animatableElements = document.querySelectorAll(
      '.card, .stat-item, .feature-card, .program-card, .university-card, h2, h3:not(.no-anim)'
    );

    animatableElements.forEach((el, index) => {
      if (!el.classList.contains('reveal-on-scroll')) {
        el.classList.add('reveal-on-scroll');
        // Stagger delay based on index modulo 3
        const delay = (index % 3) * 100;
        if (delay > 0) el.style.transitionDelay = `${delay}ms`;
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Reveal once
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));
  }

  // ========================================
  // Ripple Effect
  // ========================================
  function initRippleButtons() {
    const buttons = document.querySelectorAll('button, .btn, .btn-primary, .btn-secondary, a.btn');

    buttons.forEach((btn) => {
      btn.addEventListener('click', function (e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        btn.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  // ========================================
  // Sticky Glass Navigation
  // ========================================
  function initStickyNav() {
    const nav = document.querySelector('header');
    if (!nav) return;

    // Add glass class initially
    nav.classList.add('glass-nav');

    window.addEventListener(
      'scroll',
      () => {
        if (window.scrollY > 50) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      },
      { passive: true }
    );
  }

  // ========================================
  // Toast Notification System
  // ========================================
  const Toast = {
    container: null,

    init() {
      this.container = document.createElement('div');
      this.container.classList.add('toast-container');
      document.body.appendChild(this.container);
    },

    show(message, type = 'info', duration = 3000) {
      if (!this.container) this.init();

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;

      let icon = 'ℹ️';
      if (type === 'success') icon = '✅';
      if (type === 'error') icon = '⚠️';

      toast.innerHTML = `
                <span class="toast-icon">${icon}</span>
                <span class="toast-message">${message}</span>
            `;

      this.container.appendChild(toast);

      // Auto remove
      setTimeout(() => {
        toast.classList.add('hiding');
        toast.addEventListener('animationend', () => toast.remove());
      }, duration);
    },
  };

  // ========================================
  // Accessibility Enhancements
  // ========================================
  function initAccessibility() {
    // 1. Skip to Content Link
    if (!document.querySelector('.skip-link')) {
      const skipLink = document.createElement('a');
      skipLink.href = '#mainContent';
      skipLink.className = 'skip-link';
      skipLink.textContent = 'Skip to main content';
      document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // 2. Add ARIA labels to icon-only buttons
    document.querySelectorAll('button:not([aria-label])').forEach((btn) => {
      if (btn.innerText.trim().length === 0 || btn.querySelector('img, svg')) {
        const icon = btn.querySelector('img, svg');
        // Try to guess label from context or class
        if (btn.classList.contains('mobile-menu-btn'))
          btn.setAttribute('aria-label', 'Toggle Menu');
        else if (btn.classList.contains('theme-toggle'))
          btn.setAttribute('aria-label', 'Toggle Theme');
        else btn.setAttribute('aria-label', 'Button');
      }
    });

    // 3. Ensure Main Content has ID for Skip Link
    const main = document.querySelector('main');
    if (main && !main.id) {
      main.id = 'mainContent';
    }
  }

  // ========================================
  // Initialization
  // ========================================
  document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initRippleButtons();
    initStickyNav();
    initAccessibility();

    // Expose Toast globally
    window.Toast = Toast;
  });
})();
