/**
 * BraineX Internationalization (i18n) System
 * Supports multiple languages with dynamic switching
 */

class I18n {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'en';
    this.fallbackLanguage = 'en';
    this.translations = {};
    this.loadTranslations();
  }

  /**
   * Load translation files
   */
  async loadTranslations() {
    try {
      // Load current language
      const response = await fetch(`/assets/i18n/${this.currentLanguage}.json`);
      this.translations[this.currentLanguage] = await response.json();

      // Load fallback if different
      if (this.currentLanguage !== this.fallbackLanguage) {
        const fallbackResponse = await fetch(`/assets/i18n/${this.fallbackLanguage}.json`);
        this.translations[this.fallbackLanguage] = await fallbackResponse.json();
      }

      this.updatePageText();
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  }

  /**
   * Get translated text
   */
  t(key, params = {}) {
    const keys = key.split('.');
    let value = this.translations[this.currentLanguage];

    // Navigate through nested keys
    for (const k of keys) {
      value = value?.[k];
    }

    // Fallback to default language
    if (!value && this.currentLanguage !== this.fallbackLanguage) {
      value = this.translations[this.fallbackLanguage];
      for (const k of keys) {
        value = value?.[k];
      }
    }

    // Replace parameters
    if (value && typeof value === 'string') {
      Object.keys(params).forEach((param) => {
        value = value.replace(`{${param}}`, params[param]);
      });
    }

    return value || key;
  }

  /**
   * Change language
   */
  async setLanguage(lang) {
    this.currentLanguage = lang;
    localStorage.setItem('language', lang);
    await this.loadTranslations();

    // Dispatch event for components to update
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
  }

  /**
   * Get current language
   */
  getLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get available languages
   */
  getAvailableLanguages() {
    return [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'ar', name: 'العربية', flag: '🇸🇦' },
      { code: 'zh', name: '中文', flag: '🇨🇳' },
    ];
  }

  /**
   * Update all text on page with data-i18n attributes
   */
  updatePageText() {
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);

      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });

    // Update document direction for RTL languages
    document.documentElement.dir = ['ar', 'he'].includes(this.currentLanguage) ? 'rtl' : 'ltr';

    // Update HTML lang attribute
    document.documentElement.lang = this.currentLanguage;
  }

  /**
   * Format number according to locale
   */
  formatNumber(number, options = {}) {
    return new Intl.NumberFormat(this.currentLanguage, options).format(number);
  }

  /**
   * Format date according to locale
   */
  formatDate(date, options = {}) {
    return new Intl.DateTimeFormat(this.currentLanguage, options).format(new Date(date));
  }

  /**
   * Format currency according to locale
   */
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat(this.currentLanguage, {
      style: 'currency',
      currency,
    }).format(amount);
  }
}

// Create global instance
const i18n = new I18n();
window.i18n = i18n;

// Helper function for templates
window.t = (key, params) => i18n.t(key, params);

export default i18n;
