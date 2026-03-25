// frontend/assets/js/monitoring-dashboard.js
class UIMonitoring {
  constructor() {
    this.metrics = {
      buttonClicks: 0,
      themeToggles: 0,
      formSubmissions: 0,
      errors: 0,
    };
  }

  logButtonClick(buttonId) {
    this.metrics.buttonClicks++;
    console.log(`🖱️ Button click: ${buttonId} (Total: ${this.metrics.buttonClicks})`);
  }

  logThemeToggle(theme) {
    this.metrics.themeToggles++;
    console.log(`🌓 Theme toggled to: ${theme} (Total: ${this.metrics.themeToggles})`);
  }

  logFormSubmission(formId, success) {
    this.metrics.formSubmissions++;
    const status = success ? '✅' : '❌';
    console.log(`${status} Form submitted: ${formId} (Total: ${this.metrics.formSubmissions})`);
  }

  getReport() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      performance: {
        loadTime:
          window.performance.timing.loadEventEnd - window.performance.timing.navigationStart,
        domReady:
          window.performance.timing.domContentLoadedEventEnd -
          window.performance.timing.navigationStart,
      },
    };
  }
}

// Initialize monitoring
window.uiMonitor = new UIMonitoring();
