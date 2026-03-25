/**
 * BraineX User Analytics
 * Lightweight usage tracking (GDPR compliant privacy-first).
 */
class Analytics {
  static logEvent(category, action, label = null) {
    const eventData = {
      category,
      action,
      label,
      timestamp: new Date().toISOString(),
    };
    console.log('📈 [ANALYTICS]:', eventData);
    // Real-world: POST to /api/analytics
  }

  static trackPageView(pageName) {
    this.logEvent('Pageview', 'Visit', pageName);
  }
}

window.BraineX_Analytics = Analytics;

// Auto-track current page
document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop() || 'home';
  Analytics.trackPageView(page);
});
