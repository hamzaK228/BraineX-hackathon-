/**
 * PerformanceMonitor.js
 * Tracks Core Web Vitals and performance metrics.
 * @module Core/Performance
 */

export const performanceMonitor = {
  init() {
    if ('PerformanceObserver' in window) {
      // Track LCP
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          console.log('LCP candidate:', entry.startTime, entry);
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // Track CLS
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          console.log('Layout Shift:', entry);
        }
      }).observe({ type: 'layout-shift', buffered: true });

      // Track First Input Delay (FID) via event timing
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          console.log('FID:', entry.processingStart - entry.startTime);
        }
      }).observe({ type: 'first-input', buffered: true });
    }
  },
};
