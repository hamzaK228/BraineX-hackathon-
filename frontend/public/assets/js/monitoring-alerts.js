/**
 * BraineX Monitoring & Alerts
 * Simple alert harvester for production errors.
 */
window.addEventListener('error', (event) => {
  console.error('🚨 [ALARM] JS Error:', event.message || event.reason);
  // Real-world: POST to /api/logs
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 [ALARM] Promise Rejected:', event.reason);
});

function monitorHealth() {
  const report = window.uiMonitor ? window.uiMonitor.getReport() : null;
  if (report && report.metrics.errors > 5) {
    console.warn('⚠️ High error rate detected on client.');
  }
}

setInterval(monitorHealth, 30000); // 30s check
