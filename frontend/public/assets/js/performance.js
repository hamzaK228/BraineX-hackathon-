/**
 * Performance Utilities
 * Lazy loading, prefetching, skeleton screens, and performance monitoring
 */

(function () {
  'use strict';

  // ========================================
  // Service Worker Registration
  // ========================================
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });
          console.log('[Perf] SW registered:', registration.scope);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[Perf] New SW available');
              }
            });
          });
        } catch (error) {
          console.warn('[Perf] SW registration failed:', error);
        }
      });
    }
  }

  // ========================================
  // Lazy Loading Images
  // ========================================
  function initLazyLoading() {
    // Use native lazy loading where supported
    const images = document.querySelectorAll('img[data-src]');

    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading
      images.forEach((img) => {
        img.src = img.dataset.src;
        img.loading = 'lazy';
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
        }
      });
    } else {
      // Fallback: Intersection Observer
      const imageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
              }
              img.classList.add('loaded');
              observer.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01,
        }
      );

      images.forEach((img) => imageObserver.observe(img));
    }
  }

  // ========================================
  // Skeleton Screen Management
  // ========================================
  const SkeletonLoader = {
    // Create skeleton HTML for different card types
    templates: {
      universityCard: `
                <div class="skeleton-card">
                    <div class="skeleton-header">
                        <div class="skeleton-avatar"></div>
                        <div class="skeleton-text">
                            <div class="skeleton-line" style="width: 70%"></div>
                            <div class="skeleton-line" style="width: 50%"></div>
                        </div>
                    </div>
                    <div class="skeleton-stats">
                        <div class="skeleton-box"></div>
                        <div class="skeleton-box"></div>
                        <div class="skeleton-box"></div>
                    </div>
                    <div class="skeleton-tags">
                        <div class="skeleton-tag"></div>
                        <div class="skeleton-tag"></div>
                        <div class="skeleton-tag"></div>
                    </div>
                    <div class="skeleton-actions">
                        <div class="skeleton-button"></div>
                        <div class="skeleton-button-small"></div>
                    </div>
                </div>
            `,
      programCard: `
                <div class="skeleton-card">
                    <div class="skeleton-text">
                        <div class="skeleton-line" style="width: 40%"></div>
                        <div class="skeleton-line" style="width: 80%"></div>
                        <div class="skeleton-line" style="width: 60%"></div>
                    </div>
                    <div class="skeleton-countdown">
                        <div class="skeleton-box"></div>
                    </div>
                    <div class="skeleton-tags">
                        <div class="skeleton-tag"></div>
                        <div class="skeleton-tag"></div>
                    </div>
                    <div class="skeleton-actions">
                        <div class="skeleton-button"></div>
                    </div>
                </div>
            `,
    },

    // Show skeleton loading
    show(container, type, count = 6) {
      if (!container) return;
      const template = this.templates[type] || this.templates.universityCard;
      container.innerHTML = Array(count).fill(template).join('');
      container.classList.add('loading');
    },

    // Hide skeleton loading
    hide(container) {
      if (!container) return;
      container.classList.remove('loading');
    },
  };

  // ========================================
  // Predictive Prefetching
  // ========================================
  const PredictivePrefetch = {
    prefetched: new Set(),

    init() {
      // Prefetch on hover/focus
      document.addEventListener('mouseover', this.handleHover.bind(this));
      document.addEventListener('focus', this.handleHover.bind(this), true);

      // Prefetch visible links
      this.prefetchVisible();

      // Prefetch likely next pages
      this.prefetchPredicted();
    },

    handleHover(e) {
      const link = e.target.closest('a[href]');
      if (!link || this.prefetched.has(link.href)) return;

      const href = link.getAttribute('href');
      if (this.shouldPrefetch(href)) {
        this.prefetch(href);
      }
    },

    shouldPrefetch(href) {
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return false;
      if (href.startsWith('http') && !href.startsWith(location.origin)) return false;
      if (this.prefetched.has(href)) return false;
      return true;
    },

    prefetch(url) {
      if (this.prefetched.has(url)) return;
      this.prefetched.add(url);

      // Use link prefetch
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = 'document';
      document.head.appendChild(link);

      // Also tell service worker
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'PREFETCH',
          urls: [url],
        });
      }
    },

    prefetchVisible() {
      // Use Intersection Observer to prefetch visible links
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const href = entry.target.getAttribute('href');
              if (this.shouldPrefetch(href)) {
                this.prefetch(href);
              }
            }
          });
        },
        { rootMargin: '100px' }
      );

      document.querySelectorAll('a[href^="/"]').forEach((link) => {
        observer.observe(link);
      });
    },

    prefetchPredicted() {
      // Prefetch likely navigation targets based on current page
      const currentPath = location.pathname;
      const predictions = {
        '/': ['/fields', '/universities', '/scholarships'],
        '/fields': ['/universities', '/scholarships'],
        '/universities': ['/programs', '/scholarships'],
        '/programs': ['/scholarships', '/universities'],
        '/scholarships': ['/universities', '/programs'],
      };

      const predictedUrls = predictions[currentPath] || [];
      setTimeout(() => {
        predictedUrls.forEach((url) => this.prefetch(url));
      }, 2000);
    },
  };

  // ========================================
  // Performance Metrics Reporter
  // ========================================
  const PerformanceReporter = {
    report() {
      if (!('performance' in window)) return;

      // Wait for page load
      window.addEventListener('load', () => {
        setTimeout(() => {
          const timing = performance.getEntriesByType('navigation')[0];
          const paint = performance.getEntriesByType('paint');

          const metrics = {
            // Navigation timing
            dns: timing?.domainLookupEnd - timing?.domainLookupStart,
            tcp: timing?.connectEnd - timing?.connectStart,
            ttfb: timing?.responseStart - timing?.requestStart,
            download: timing?.responseEnd - timing?.responseStart,
            domInteractive: timing?.domInteractive,
            domComplete: timing?.domComplete,
            loadEvent: timing?.loadEventEnd - timing?.loadEventStart,

            // Paint timing
            fcp: paint.find((p) => p.name === 'first-contentful-paint')?.startTime,
            fp: paint.find((p) => p.name === 'first-paint')?.startTime,
          };

          console.log('[Perf] Metrics:', metrics);

          // Report to analytics if needed
          this.reportToAnalytics(metrics);
        }, 0);
      });

      // Web Vitals
      this.observeWebVitals();
    },

    observeWebVitals() {
      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('[Perf] LCP:', lastEntry.startTime);
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

          // Cumulative Layout Shift
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            console.log('[Perf] CLS:', clsValue);
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });

          // First Input Delay
          const fidObserver = new PerformanceObserver((entryList) => {
            const firstInput = entryList.getEntries()[0];
            console.log('[Perf] FID:', firstInput.processingStart - firstInput.startTime);
          });
          fidObserver.observe({ type: 'first-input', buffered: true });
        } catch (e) {
          console.warn('[Perf] PerformanceObserver error:', e);
        }
      }
    },

    reportToAnalytics(metrics) {
      // Placeholder for analytics reporting
      // Could send to Google Analytics, custom endpoint, etc.
    },
  };

  // ========================================
  // Resource Hints
  // ========================================
  function addResourceHints() {
    const head = document.head;

    // Preconnect to CDNs
    const preconnects = [
      'https://cdnjs.cloudflare.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ];

    preconnects.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      link.crossOrigin = 'anonymous';
      head.appendChild(link);
    });

    // DNS prefetch for external resources
    const dnsPrefetch = ['https://cdnjs.cloudflare.com'];

    dnsPrefetch.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = url;
      head.appendChild(link);
    });
  }

  // ========================================
  // Initialize
  // ========================================
  function init() {
    registerServiceWorker();
    initLazyLoading();
    addResourceHints();
    PredictivePrefetch.init();
    PerformanceReporter.report();
  }

  // Run on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose utilities globally
  window.BrainexPerf = {
    SkeletonLoader,
    PredictivePrefetch,
    PerformanceReporter,
  };
})();
